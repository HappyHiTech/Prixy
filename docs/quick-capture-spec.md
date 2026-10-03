# Quick Capture — Technical Specification

**Status:** Approved design, not yet implemented
**Branch:** `feat/quick-capture`
**Date:** 2026-10-03

---

## 1. Summary

The user types free text on the Quick Capture screen and taps **Save**. The
backend sends that text to Claude (via Amazon Bedrock) together with the
user's existing prayees and categories. Claude splits the text into one or
more prayer requests, cleans up the wording, and matches each request to a
prayee and category when the match is clear. The backend saves every request
in one transaction and returns them. The app goes back to Home, whose lists
refresh automatically.

Example input:

> um pray for my mom's surgery on friday, and also jake who's looking for a job

Example result (assuming the user has a prayee "Jake" and categories
"Family" and "Friends", but no prayee for their mom):

| requestText             | prayee | category | status   |
| ----------------------- | ------ | -------- | -------- |
| Mom's surgery on Friday | null   | Family   | `inbox`  |
| Jake looking for a job  | Jake   | Friends  | `active` |

---

## 2. Decisions

Each decision below was made during design. The rationale is recorded so it
doesn't get re-argued later.

| # | Decision | Why |
| - | -------- | --- |
| D1 | **The LLM splits, cleans, and matches prayee + category** to existing records. It never creates new prayees or categories. | Matching is where the value is. Creating records invites duplicates ("Mom" vs "my mom"), and taxonomy cleanup is a v1 non-goal. |
| D2 | **Synchronous request/response.** One `POST`, one Lambda, response holds the created requests. | One LLM call on short text takes seconds, well under API Gateway's 29s limit. The voice pipeline is async only because Transcribe jobs are slow. |
| D3 | **Claude via Amazon Bedrock, reached through a VPC interface endpoint.** | The Lambda must sit in the VPC to reach RDS, and the VPC has no internet route. An interface endpoint gives a private path to Bedrock for about $7/month (one AZ). Auth is IAM, so there is no API key to store. A NAT gateway (about $32/month or more) and a two-call client-coordinated split were rejected. |
| D4 | **Use the `bedrock-runtime` (InvokeModel) endpoint, not Mantle.** SDK client: `AnthropicBedrock` from `@anthropic-ai/bedrock-sdk`. | `bedrock-runtime` supports structured outputs and has a well-known VPC endpoint service. Mantle lists structured outputs as not supported, and we couldn't confirm a VPC endpoint for it. |
| D5 | **Model: Claude Haiku 4.5** (`global.anthropic.claude-haiku-4-5-20251001-v1:0`), no thinking. | Sonnet 5.5 was the original choice, but this account has 0 Bedrock quota for Sonnet 5 and 5.5 (it started on the free plan). Haiku is fast and cheap enough for splitting and matching (about $0.0016 per capture). The model ID is an env var; moving to a Sonnet later means changing it and adding back `thinking: { type: "adaptive" }` + `effort: "low"`. |
| D6 | **The existing status rule applies unchanged.** A request is `active` when both `prayeeId` and `categoryId` are set, otherwise `inbox`. The prompt tells the model to leave a field `null` unless the match is clear. | Keeps one invariant everywhere. Uncertain matches land in the Inbox for review. |
| D7 | **Fail cleanly.** If the LLM step fails, save nothing and return an error. The text stays in the app so the user can retry. | All-or-nothing behavior. No silent fallback that hides Bedrock problems. |
| D8 | **`raw_transcript` = the AI's cleaned text** for each request, set once at creation. | Matches the doc's definition ("original AI output before user edits") and the voice path. |
| D9 | **The user's raw typed input is not stored.** | Nothing reads it, and prayer content is personal. Easy to add later if a feature needs it. |
| D10 | **Shared pipeline modules:** `parseRequests` and `insertRequests` live in `backend/shared/capture/`. | Text capture enters the AI pipeline at the same point voice does after transcription. The future voice "Lambda #2" reuses both modules. |
| D11 | **After a successful save, go straight back to Home.** No toast, no results screen. | Fastest for a "quick" capture. A toast is a cheap follow-up if users get confused about where requests went. |

---

## 3. Architecture

```
QuickCaptureScreen
  │  user taps Save
  ▼
POST /prayers/capture  { text }
  │  API Gateway + Cognito authorizer → claims.sub
  ▼
CapturePrayersFunction  (Lambda, in VPC)
  1. Validate body
  2. DB: look up user_id by cognito_sub; load prayees + categories   → release connection
  3. parseRequests(text, prayees, categories)
       ├─ callModel ──► VPC endpoint ──► Bedrock (Claude Haiku 4.5)
       └─ validateSplits  (pure function)
  4. DB: insertRequests(...) in one transaction                     → release connection
  5. 201 PrayerRequest[]
  ▼
App: reset store → router.back() → TanStack invalidates ['prayerRequests'] → Home refetches
```

How the voice pipeline will reuse this later:

```
Voice:  audio → S3 → Transcribe → transcript ─┐
                                              ├─► parseRequests → insertRequests
Text:   user types ───────────────────────────┘
```

**The DB connection is released during the LLM call.** The handler opens
one connection to load the lists, releases it, calls Bedrock, then opens
another for the insert. The pool has `max: 3`, so holding a connection idle
for several seconds while waiting on the model would waste it.

---

## 4. API contract

### `POST /prayers/capture`

Auth: Cognito (`CognitoAuth` authorizer), same as the other `/prayers` routes.

**Request body**

```json
{ "text": "pray for my mom's surgery on friday, and jake's job search" }
```

**Responses**

| Status | When | Body |
| ------ | ---- | ---- |
| `201` | At least one request created | `PrayerRequest[]` (same field shape as `POST /prayers`) |
| `400` | Body missing or not JSON, `text` not a string, empty after trimming, or longer than `MAX_INPUT_CHARS` | `{ "message": "..." }` |
| `401` | No Cognito `sub` | `{ "message": "Unauthenticated" }` |
| `404` | No `users` row for the `sub` | `{ "message": "User not found" }` |
| `422` | The model ran fine but found no prayer requests in the text (for example "asdf") | `{ "message": "Couldn't find a prayer request in that text." }` |
| `502` | Bedrock call failed (throttled, timed out, model access missing, bad output) | `{ "message": "Couldn't process that right now. Please try again." }` |
| `500` | Anything else (DB errors) | `{ "message": "..." }` |

`message` strings are user-facing. The frontend's `ApiError` already shows
the server's `message`.

**Constants** (top of `functions/prayers/capture/index.js`):

| Name | Value | Purpose |
| ---- | ----- | ------- |
| `MAX_INPUT_CHARS` | `5000` | Bounds token cost and latency |
| `MAX_SPLITS` | `20` | Caps the rows one capture can create (enforced in `validateSplits`) |

---

## 5. Backend

### 5.1 File layout

```
backend/
├── shared/
│   ├── db.js                       (existing)
│   └── capture/
│       ├── parseRequests.js        callModel + validateSplits + parseRequests
│       ├── parseRequests.test.js   node:test unit tests for validateSplits
│       └── insertRequests.js       transactional insert
└── functions/prayers/capture/
    ├── index.js                    handler
    ├── package.json                pg, @aws-sdk/rds-signer, @anthropic-ai/bedrock-sdk
    └── Makefile                    same copy-shared pattern as prayers/create
```

`@anthropic-ai/bedrock-sdk` goes in the **function's** `package.json`. The
Makefile copies `shared/` into the build artifact, and `npm install` runs
there, so `shared/capture/*.js` resolves the package from the function's
`node_modules`.

### 5.2 Handler — `functions/prayers/capture/index.js`

1. Read `sub` from `event.requestContext.authorizer.claims.sub`. If missing, return `401`.
2. Parse `event.body` as JSON. Validate `text` (§4). Use the trimmed text from here on.
3. `withClient`: select `users.id` by `cognito_sub` (`404` if none), then:
   - `SELECT id, name FROM prayees WHERE user_id = $1`
   - `SELECT id, name FROM categories WHERE user_id = $1`
4. Call `parseRequests(text, prayees, categories)`.
   - If it throws, return `502` and log the error. Log the error only, never the user's text.
   - If it returns `[]`, return `422`.
5. `withClient`: `insertRequests(client, userId, splits, 'manual')`.
6. Return `201` with the array.

Response headers and error shape follow the existing handlers
(`Content-Type: application/json`, `{ message }`).

### 5.3 `shared/capture/parseRequests.js`

Exports `parseRequests` and `validateSplits` (the latter for tests).

#### Client setup (module scope)

```js
const { AnthropicBedrock } = require("@anthropic-ai/bedrock-sdk");
const client = new AnthropicBedrock({
  awsRegion: process.env.AWS_REGION,  // set automatically by Lambda
  timeout: 10_000,                     // ms
  maxRetries: 1,
});
```

- **Module scope**, so warm invocations reuse it, like the pool in `db.js`.
- **Credentials** come from the Lambda execution role through the default AWS chain. No keys in code.
- **Timeout budget:** the SDK retries timeouts, so worst case is `10s × (1 + 1) = 20s`. That stays under the Lambda's 25s timeout, so a slow model fails as a clean `502`, not a Lambda kill.

#### `callModel(text, prayees, categories)`

Request:

| Field | Value |
| ----- | ----- |
| `model` | `process.env.BEDROCK_MODEL_ID` |
| `max_tokens` | `2048` |
| `output_config` | `{ format: <schema below> }` |
| `system` | Prompt rules below |
| `messages` | One user message: the prayee list, the category list, and the text inside `<capture>` tags |

No `thinking` and no `effort`. Haiku 4.5 rejects `effort`, and leaving
`thinking` out turns it off, which is faster and cheaper for this task.

Lists are rendered as one `id: name` pair per line, under `<prayees>` and
`<categories>` headings. Empty lists are rendered as `(none)`.

**Output schema** (structured outputs):

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["requests"],
  "properties": {
    "requests": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["requestText", "prayeeId", "categoryId"],
        "properties": {
          "requestText": { "type": "string" },
          "prayeeId":    { "type": ["string", "null"] },
          "categoryId":  { "type": ["string", "null"] }
        }
      }
    }
  }
}
```

Before returning, check `stop_reason`. Anything other than `end_turn`
(for example `max_tokens` or `refusal`) is an error and surfaces as a `502`.
Then `JSON.parse` the text block.

**System prompt rules** (wording is up to the implementer; these are the
requirements):

1. Split the capture into one request per distinct person or need. A single
   need about one person is one request.
2. `requestText`: rewrite into a short, clear request in the user's voice.
   Remove filler and false starts, and fix grammar. Never add details that
   weren't in the text.
3. `prayeeId`: set it only when the request clearly refers to a listed
   prayee (same name, case-insensitive, or an unambiguous reference such as
   "Mom" when a prayee is named "Mom"). Otherwise `null`. When in doubt,
   use `null`.
4. `categoryId`: set it only when one listed category clearly fits.
   Otherwise `null`.
5. Only use ids from the lists provided.
6. If the text contains no prayer request, return `{ "requests": [] }`.

#### `validateSplits(raw, prayees, categories)` — pure function

Input: the parsed model output. Output: a clean array. Rules, in order:

1. If `raw.requests` is not an array, **throw**. That becomes a `502`.
2. For each item: trim `requestText`. Drop the item if it isn't a non-empty string.
3. `prayeeId` → keep only if it is one of the given prayee ids, else `null`. Same for `categoryId`.
4. Truncate the result to `MAX_SPLITS` items.

Step 3 is the security boundary. It guarantees the model can never attach a
request to an id it invented or to another user's record, whatever the
prompt says.

#### `parseRequests(text, prayees, categories)`

`validateSplits(await callModel(...), prayees, categories)`. This is the
only function the handler (and later the voice Lambda) calls.

### 5.4 `shared/capture/insertRequests.js`

`insertRequests(client, userId, splits, sourceType) → PrayerRequest[]`

- `BEGIN`, then one `INSERT` per split, then `COMMIT`. On any error,
  `ROLLBACK` and rethrow. A loop is fine because there are at most 20 rows.
- Columns per row:

| Column | Value |
| ------ | ----- |
| `user_id` | `userId` |
| `prayee_id` | `split.prayeeId` |
| `category_id` | `split.categoryId` |
| `request_text` | `split.requestText` |
| `raw_transcript` | `split.requestText` (D8) |
| `source_type` | `sourceType` (`'manual'` for text, `'voice'` later) |
| `status` | `prayeeId && categoryId ? 'active' : 'inbox'` (D6) |

- `RETURNING` uses the same column list and aliases as
  `functions/prayers/create/index.js`, so the response shape matches
  `POST /prayers`.
- No schema migration is needed. Every column already exists in
  `001_init.sql`.

---

## 6. Infrastructure (`backend/infra/template.yaml`)

### 6.1 Bedrock VPC endpoint

Two new resources:

**`BedrockEndpointSecurityGroup`** (`AWS::EC2::SecurityGroup`)
- `VpcId`: the VPC that contains the existing DB subnets (see §11)
- Ingress: TCP 443 from `SourceSecurityGroupId: sg-0e9a01494cd64eac2` (the Lambda SG)

**`BedrockRuntimeEndpoint`** (`AWS::EC2::VPCEndpoint`)

| Property | Value |
| -------- | ----- |
| `VpcEndpointType` | `Interface` |
| `ServiceName` | `!Sub com.amazonaws.${AWS::Region}.bedrock-runtime` |
| `VpcId` | same VPC |
| `SubnetIds` | **one** subnet, e.g. `subnet-00fcbf804a78fef47` (one AZ keeps cost to about $7/month) |
| `SecurityGroupIds` | `!Ref BedrockEndpointSecurityGroup` |
| `PrivateDnsEnabled` | `true` |

**Why `PrivateDnsEnabled` matters:** it makes the normal hostname
`bedrock-runtime.us-west-2.amazonaws.com` resolve to the endpoint's private
IP inside the VPC. The SDK needs no config change. Lambdas in the other
subnet still reach the endpoint through the VPC's local routing (a tiny
cross-AZ data charge).

The Lambda SG must allow **outbound** TCP 443 to the endpoint SG. The
default SG egress rule allows all outbound traffic, so check it (§11).

### 6.2 `CapturePrayersFunction`

| Property | Value |
| -------- | ----- |
| `Metadata.BuildMethod` | `makefile` |
| `CodeUri` | `../functions/prayers/capture/` |
| `Handler` | `index.handler` |
| `MemorySize` | `*dbFunctionMemory` |
| `Timeout` | `25` (overrides `Globals` 10; must stay under API Gateway's 29s) |
| `VpcConfig` | `*dbVpcConfig` |
| `Environment.Variables` | the four `DB_*` vars **plus** `BEDROCK_MODEL_ID` |
| `Policies` | the `rds-db:connect` statement **plus** a `bedrock:InvokeModel` statement scoped to the model |
| Event | `Api`, `RestApiId: !Ref PrixyApi`, `Path: /prayers/capture`, `Method: post`, `Authorizer: CognitoAuth` |

The `*dbEnvironment` and `*dbPolicies` anchors can't be extended with an
extra entry. Write `Environment` and `Policies` out in full for this
function.

**IAM scoping:** grant `bedrock:InvokeModel` only on the ARNs the model ID
resolves to. If the ID is a cross-region (`global.` / `us.`) inference
profile, the policy needs the inference-profile ARN **and** the underlying
foundation-model ARNs. For `global.anthropic.claude-haiku-4-5-20251001-v1:0`:

- `arn:aws:bedrock:${AWS::Region}:${AWS::AccountId}:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0`
- `arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`
- `arn:aws:bedrock:::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`

---

## 7. Frontend

### 7.1 API — `src/apis/prayerRequest.api.ts`

```ts
export async function capturePrayerRequests(text: string): Promise<PrayerRequest[]> {
  return apiFetch<PrayerRequest[]>('/prayers/capture', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
```

### 7.2 Hook — `src/hooks/TanStack/prayerRequest/useCapturePrayersMutation.ts`

Modeled on `useCreatePrayerRequestMutation`:
- `mutationFn: capturePrayerRequests`
- `onSuccess`: `queryClient.invalidateQueries({ queryKey: ['prayerRequests'] })`

### 7.3 `QCSaveButton`

| State | Behavior |
| ----- | -------- |
| Text empty or only whitespace | Button disabled |
| `isPending` | Button disabled, shows `ActivityIndicator` instead of "Save" (blocks double-submit duplicates) |
| Success | `useQCStore.reset()`, then `router.back()` |
| Error | Store untouched (text stays). Show `error.message` (an `ApiError`, already user-facing) above the button. Cleared on the next attempt. |

No changes to `QuickCaptureScreen`, `TextBody`, or `QCHeader`.

---

## 8. Error handling summary

| Failure | Where caught | User sees | Data written |
| ------- | ------------ | --------- | ------------ |
| Empty or too-long text | Handler validation | 400 message (the button is also disabled for empty text) | None |
| Bedrock throttling or timeout, model not enabled, VPC endpoint misconfigured | `callModel` throws → handler | 502 "Couldn't process that right now…" | None |
| Model output truncated or refused, or the wrong shape | `callModel` / `validateSplits` throws → handler | 502 | None |
| No requests found in the text | Handler (`[]`) | 422 "Couldn't find a prayer request…" | None |
| Invented or foreign ids | `validateSplits` | Nothing. The id silently becomes `null` and the request lands in the Inbox | Rows saved |
| DB error mid-insert | `insertRequests` rolls back → handler | 500 | None (transaction) |

**Logging:** log error types and messages and Bedrock request ids. Do not
log the user's text or the model output, since both contain personal prayer
content.

---

## 9. Testing

### 9.1 Unit tests (`node:test`, no new dependencies)

`backend/shared/capture/parseRequests.test.js`, run with
`node --test backend/shared/capture/`. These cover `validateSplits` only,
since it is a pure function:

| Case | Expect |
| ---- | ------ |
| Valid items with known ids | Returned unchanged (text trimmed) |
| Unknown `prayeeId` | Becomes `null`; `categoryId` untouched |
| Id that belongs to a different list (prayee id given as `categoryId`) | Becomes `null` |
| Empty or whitespace `requestText` | Item dropped |
| 25 valid items | 20 returned |
| `raw.requests` missing or not an array | Throws |

### 9.2 Manual end-to-end (after `sam build && sam deploy`)

1. `curl` `POST /prayers/capture` with a valid ID token and a multi-person sentence. Expect `201` and several items.
2. Check in the DB: statuses follow the rule, `raw_transcript = request_text`, `source_type = 'manual'`.
3. **Networking check:** a response in a few seconds means the VPC endpoint works. A hang of about 25s followed by a `502` or a Lambda timeout is the classic sign of a VPC routing, DNS, or SG problem.
4. Set `BEDROCK_MODEL_ID` to an invalid value and redeploy. Expect a `502`, and expect no rows written.
5. Send `"asdf"`. Expect `422`.
6. In the app: type, Save, see the spinner, land on Home, and the lists show the new requests. Then turn on airplane mode and Save: the text stays and an error shows.

---

## 10. Documentation updates (do before writing code)

Per CLAUDE.md, `docs/system-design.md` changes first:

- **§3 API Contract:** add a row: `POST /prayers/capture` · body `{ text }` · response `PrayerRequest[]` · "text quick capture; LLM splits and matches prayee/category; see Quick Capture spec".
- **§4 AI Pipeline:** add a note that text capture enters at step 4 (the LLM step) and shares `parseRequests` / `insertRequests` with Lambda #2. It uses Bedrock through a VPC interface endpoint.
- **§7 Open Questions:** record that AI-matched requests follow the existing Inbox → Active rule (D6), and that raw typed input is not stored (D9).
- **CLAUDE.md:** the Tech Stack "AI pipeline" line can now name Claude Haiku 4.5 via Amazon Bedrock.

---

## 11. Verify during implementation

Open at design time. Status as of Bedrock setup:

1. ✅ **Model access:** Sonnet 5 and 5.5 have 0 quota on this account, so the model switched to Haiku 4.5 (D5). The use-case form is submitted and the account is on the paid plan. The Haiku subscription needed a valid payment method (`INVALID_PAYMENT_INSTRUMENT` while on the free plan).
2. ✅ **Model ID:** Haiku 4.5 supports inference profiles only. Use `global.anthropic.claude-haiku-4-5-20251001-v1:0` (the account's quota is on the global profile). IAM ARNs are in §6.2.
3. ⏳ **Structured outputs on `bedrock-runtime` for Haiku 4.5:** confirmed by `~/bedrock-smoke/smoke.js` printing `end_turn` and `{"ok":true}`. **Fallback if not supported:** a single tool with `strict: true` whose `input_schema` is the same schema, and a prompt instruction to call it; read `tool_use.input`.
4. ✅ **SDK import:** `const { AnthropicBedrock } = require("@anthropic-ai/bedrock-sdk")` (v0.34.2). Default base URL is `https://bedrock-runtime.us-west-2.amazonaws.com`.
5. ✅ **VPC id:** `vpc-0f0e0e699233fa1e2` (default VPC; DNS support and hostnames enabled; no existing endpoints).
6. ✅ **Lambda SG egress:** `sg-0e9a01494cd64eac2` allows all outbound traffic, so no change is needed.

---

## 12. Out of scope

- Toast or results screen after save (possible follow-up to D11)
- Creating new prayees or categories from a capture
- Storing raw input; a `Capture` / generalized `Recording` table
- The voice pipeline (it will reuse `shared/capture/` when built)
- Moving `useQCStore` from `src/stores/` to `src/features/quickCapture/store/`
- Retries in the client beyond the user tapping Save again
