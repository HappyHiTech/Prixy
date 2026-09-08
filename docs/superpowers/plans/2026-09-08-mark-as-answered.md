# Mark As Answered Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Mark As Answered" pill on the Individual Prayer Screen a working toggle that persists `status` and `answeredAt` to the database and inverts its colors when the request is answered.

**Architecture:** The existing `PATCH /prayers/:id` Lambda gains a single new
updatable field, `answered` (a boolean, not a raw status string — the client
never sends a status; the server derives it, per the design doc's Inbox →
Active Deck rule). `answered: true` sets `status='answered'` and
`answered_at=now()`. `answered: false` clears `answered_at` and re-derives
status from whether `prayee_id`/`category_id` are both non-null. The frontend
reuses the existing `useUpdatePrayerRequest` mutation — no new hook, no new
endpoint — and `EditAnswered` becomes a controlled `Pressable` driven by
`prayer.status === 'answered'`.

**Tech Stack:** AWS Lambda (Node.js, `pg`), API Gateway (SAM), PostgreSQL,
React Native / Expo, TanStack Query v5, TypeScript.

**Spec:** `docs/system-design.md` (§3 data model, §4 API contract, §7 Inbox →
Active Deck rule). Note: the spec's API table lists `POST /prayers/:id/answer`.
This plan deliberately diverges — the user chose to extend `PATCH /prayers/:id`
instead — and **Task 5 updates the spec to match**.

## Global Constraints

- `PrayerRequest.status` is exactly one of `inbox` / `active` / `answered`.
  Never introduce a fourth value.
- The client **never** sends `status`. It is always derived server-side
  (`docs/system-design.md:198`). The new field is named `answered` and is a
  boolean.
- The Inbox → Active Deck rule: a request is `active` exactly when both
  `prayeeId` and `categoryId` are non-null, otherwise `inbox`. This is the
  rule to fall back to when un-answering.
- Colors come from `@/constants` `COLORS` only — no hex literals in component
  styles. Accent is `COLORS.accent` (`#3D5A6C`), white is `COLORS.primary`
  (`#FFFFFF`).
- Frontend imports use the `@/*` alias (→ `frontend/src/*`), never relative
  paths across feature boundaries.
- Route files in `frontend/src/app/` stay thin; all logic lives in
  `frontend/src/features/`.
- There is **no test runner in this repo**. Every task is verified manually
  with the exact commands given. Do not add Jest.

---

### Task 1: Backend — accept `answered` in PATCH /prayers/:id

**Files:**
- Modify: `backend/functions/prayers/update/index.js:3-9` (UPDATABLE_FIELDS),
  `:50-62` (no-op guard), `:64-74` (validation block),
  `:122-138` (values/setClause/fieldExpr), `:192-201` (UPDATE statement)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `PATCH /prayers/:id` now accepts `{ answered: boolean }` in the
  JSON body, alone or alongside the existing fields
  (`prayeeId`, `categoryId`, `requestText`, `frequencyType`, `recurringDays`).
  Responds `200` with the full `PrayerRequest` row — including the updated
  `status` and `answeredAt` — on success, `400` on a non-boolean `answered`.

**Background you need before editing this file (read it, it is subtle):**

`answered` is *not* a plain column update like `requestText` is. It drives two
columns at once (`status` and `answered_at`), and `status` is already computed
by a `CASE` expression at `index.js:195-201`. So `answered` must be added to
`UPDATABLE_FIELDS` so it is recognized and validated and gets a `$n`
placeholder, but it must **not** appear in the generated `SET` clause — there
is no `answered` column. That is why Step 3 filters it out of `setClause`
while keeping it in `values`.

Also note the comment already in the file at `:128-131`: inside `SET`, a
column name like `pr.status` resolves to the row's **pre-UPDATE** value. That
is why the existing code uses `fieldExpr()` to read a field from its
placeholder when that field is part of the same PATCH. The same trick is
needed here so that a PATCH that both un-answers and sets a category derives
the right status.

- [ ] **Step 1: Add `answered` to the recognized fields**

In `backend/functions/prayers/update/index.js`, replace the `UPDATABLE_FIELDS`
constant (lines 3-9) with:

```js
// `answered` has no column of its own - it drives `status` and `answered_at`
// in the UPDATE's CASE expressions. It is listed here so it counts as a valid
// PATCH field and gets a $n placeholder; ANSWERED_FIELD excludes it from SET.
const UPDATABLE_FIELDS = {
  prayeeId: "prayee_id",
  categoryId: "category_id",
  requestText: "request_text",
  frequencyType: "frequency_type",
  recurringDays: "recurring_days",
  answered: null,
};

const ANSWERED_FIELD = "answered";
```

- [ ] **Step 2: Validate the `answered` value**

Immediately after the `requestText` validation block (which ends at line 74,
the closing `}` before the `frequencyType` check), insert:

```js
  if ("answered" in body && typeof body.answered !== "boolean") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "answered must be a boolean" }),
    };
  }
```

- [ ] **Step 3: Keep `answered` out of the SET clause**

Replace the `setClause` construction (lines 124-126) with:

```js
  const setClause = updates
    .filter((f) => f !== ANSWERED_FIELD)
    .map((f) => `${UPDATABLE_FIELDS[f]} = $${updates.indexOf(f) + 3}${FIELD_CASTS[f] ?? ""}`)
    .join(", ");
```

The index must come from `updates.indexOf(f)`, not from the `.map` callback's
index — after `.filter()` those two disagree, and using the wrong one silently
binds the wrong placeholder.

Leave `const values = [sub, id, ...updates.map((f) => body[f])];` on line 123
exactly as it is — `answered` still needs its placeholder.

- [ ] **Step 4: Add an `answered` placeholder expression**

Directly below the existing `prayeeExpr` / `categoryExpr` definitions
(lines 137-138), add:

```js
  // NULL when this PATCH does not touch `answered`, so the CASE below falls
  // through to the existing status-derivation rules.
  const answeredIdx = updates.indexOf(ANSWERED_FIELD);
  const answeredExpr =
    answeredIdx === -1 ? "NULL::boolean" : `$${answeredIdx + 3}::boolean`;
```

- [ ] **Step 5: Rewrite the status CASE and set `answered_at`**

Replace the `SET` block of the UPDATE (lines 194-201) — everything from
`SET ${setClause},` down to and including the `END` that closes the status
`CASE`, stopping just before the `FROM users u` line, which stays as it is —
with:

```sql
            SET ${setClause}${setClause ? "," : ""}
                status = CASE
                  WHEN ${answeredExpr} IS TRUE THEN 'answered'
                  WHEN ${answeredExpr} IS FALSE
                   AND ${prayeeExpr} IS NOT NULL
                   AND ${categoryExpr} IS NOT NULL
                  THEN 'active'
                  WHEN ${answeredExpr} IS FALSE THEN 'inbox'
                  WHEN pr.status = 'answered' THEN pr.status
                  WHEN ${prayeeExpr} IS NOT NULL
                   AND ${categoryExpr} IS NOT NULL
                  THEN 'active'
                  ELSE 'inbox'
                END,
                answered_at = CASE
                  WHEN ${answeredExpr} IS TRUE THEN now()
                  WHEN ${answeredExpr} IS FALSE THEN NULL
                  ELSE pr.answered_at
                END
```

Read the branch order top to bottom — it is the whole feature:

1. `answered: true` → always `answered`, whatever the prayee/category are.
2. `answered: false` + both fields set → back to `active`.
3. `answered: false` + a field missing → back to `inbox`.
4. `answered` absent + already answered → unchanged (the existing exemption
   from `docs/system-design.md:199`).
5-6. `answered` absent, not answered → the existing derivation rule.

The `${setClause ? "," : ""}` matters: a PATCH of `{ answered: true }` alone
produces an empty `setClause`, and `SET , status = ...` is a syntax error.

- [ ] **Step 6: Verify the file parses**

Run:

```bash
node --check backend/functions/prayers/update/index.js
```

Expected: no output (exit 0). Any output means a syntax error — fix it before
moving on.

- [ ] **Step 7: Commit**

```bash
git add backend/functions/prayers/update/index.js
git commit -m "feat(backend): allow answered toggle in prayer request PATCH"
```

---

### Task 2: Backend — deploy and verify against the real database

**Files:**
- No file changes. This task is deployment + verification of Task 1.

**Interfaces:**
- Consumes: the `answered` field from Task 1.
- Produces: a deployed `PATCH /prayers/:id` that Task 4's UI can call.

No SAM template change is needed — `PATCH /prayers/{id}` already routes to
`UpdatePrayerFunction` (`backend/infra/template.yaml:349-367`), and this task
only changed that function's code.

- [ ] **Step 1: Build and deploy**

```bash
cd backend/infra
sam build && sam deploy
```

Expected: `Successfully created/updated stack`. If `sam deploy` prompts for
confirmation, review the changeset — it should show only
`UpdatePrayerFunction` being modified.

- [ ] **Step 2: Get an API URL and auth token**

You need the API base URL and a valid Cognito ID token. The base URL is the
`ApiUrl` stack output:

```bash
aws cloudformation describe-stacks \
  --stack-name $(grep -m1 stack_name backend/infra/samconfig.toml | cut -d'"' -f2) \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text
```

For the token, sign in through the Expo app and copy the ID token your API
client sends (see `frontend/src/apis/apiClient.ts` for where it is attached),
or reuse whatever method you already use to hit these endpoints by hand.

Export both:

```bash
export API_URL="<the ApiUrl output>"
export TOKEN="<a valid Cognito ID token>"
export PRAYER_ID="<the id of an existing active prayer request>"
```

- [ ] **Step 3: Mark it answered**

```bash
curl -s -X PATCH "$API_URL/prayers/$PRAYER_ID" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answered": true}'
```

Expected: `200` with a JSON body where `"status":"answered"` and
`"answeredAt"` is a timestamp (not `null`).

- [ ] **Step 4: Un-mark it**

```bash
curl -s -X PATCH "$API_URL/prayers/$PRAYER_ID" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answered": false}'
```

Expected: `"answeredAt":null`, and `"status":"active"` if that request has both
a `prayeeId` and a `categoryId`, otherwise `"status":"inbox"`.

- [ ] **Step 5: Verify the answered exemption still holds**

Mark it answered again (repeat Step 3), then send an unrelated edit:

```bash
curl -s -X PATCH "$API_URL/prayers/$PRAYER_ID" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestText": "still answered after an unrelated edit"}'
```

Expected: `"status":"answered"` — unchanged. This is branch 4 of the CASE; if
it comes back `active` or `inbox`, the branch order in Task 1 Step 5 is wrong.

- [ ] **Step 6: Verify the bad-input guard**

```bash
curl -s -X PATCH "$API_URL/prayers/$PRAYER_ID" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answered": "yes"}'
```

Expected: `400` with `{"message":"answered must be a boolean"}`.

Then leave the record un-answered so later tasks start from a clean state
(repeat Step 4).

---

### Task 3: Frontend — plumb `answered` through the API and mutation types

**Files:**
- Modify: `frontend/src/apis/prayerRequest.api.ts:23-29` (`UpdatePrayerRequestBody`)
- Modify: `frontend/src/hooks/TanStack/useUpdatePrayerRequestMutation.ts:6-17`
  (`UpdatePrayerRequestVariables`), `:27-42` (`onMutate`)

**Interfaces:**
- Consumes: the `answered` request field from Task 1.
- Produces: `useUpdatePrayerRequest().mutate({ id, answered: boolean })` is a
  valid, type-checked call. The optimistic cache update sets
  `status: 'answered' | 'active' | 'inbox'` immediately so the pill flips on tap.

**Why `onMutate` needs a special case:** the existing `onMutate` spreads
`updates` straight onto the cached `PrayerRequest`. `answered` is not a field
on `PrayerRequest` — spreading it would write a junk `answered` key and, worse,
would leave `status` stale, so the pill would not visibly flip until the server
responded. So `answered` gets translated into an optimistic `status` and
stripped from the spread.

- [ ] **Step 1: Add `answered` to the request body type**

In `frontend/src/apis/prayerRequest.api.ts`, replace the
`UpdatePrayerRequestBody` type (lines 23-29) with:

```ts
type UpdatePrayerRequestBody = {
  prayeeId?: string | null;
  categoryId?: string | null;
  requestText?: string;
  frequencyType?: PrayerRequestFrequencyType;
  recurringDays?: string[];
  answered?: boolean;
};
```

- [ ] **Step 2: Add `answered` to the mutation variables**

In `frontend/src/hooks/TanStack/useUpdatePrayerRequestMutation.ts`, replace the
`UpdatePrayerRequestVariables` type (lines 6-17) with:

```ts
type UpdatePrayerRequestVariables = {
  id: string;
  answered?: boolean;
} & Partial<
  Pick<
    PrayerRequest,
    | 'prayeeId'
    | 'categoryId'
    | 'requestText'
    | 'frequencyType'
    | 'recurringDays'
  >
>;
```

`answered` sits outside the `Pick` because it is a request-only field — it is
not a property of `PrayerRequest`.

- [ ] **Step 3: Translate `answered` into an optimistic status**

Replace the whole `onMutate` callback (lines 27-42) with:

```ts
    onMutate: async ({
      id,
      answered,
      ...updates
    }: UpdatePrayerRequestVariables) => {
      const key = ['prayerRequest', id];

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<PrayerRequest>(key);

      if (previous) {
        const next: PrayerRequest = { ...previous, ...updates };

        // `answered` is a request-only field. Mirror the server's derivation
        // (backend/functions/prayers/update/index.js) so the pill flips on tap
        // instead of waiting for the response. onSuccess overwrites this with
        // the authoritative row.
        if (answered !== undefined) {
          next.status = answered
            ? 'answered'
            : next.prayeeId && next.categoryId
              ? 'active'
              : 'inbox';
          next.answeredAt = answered ? new Date().toISOString() : null;
        }

        queryClient.setQueryData<PrayerRequest>(key, next);
      }

      return { key, previous };
    },
```

Note `answered` is destructured out, so it can never leak into the cached
object via the `...updates` spread.

- [ ] **Step 4: Typecheck**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors. (If pre-existing unrelated errors appear, confirm they
also appear on a clean checkout before ignoring them.)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/apis/prayerRequest.api.ts \
        frontend/src/hooks/TanStack/useUpdatePrayerRequestMutation.ts
git commit -m "feat(frontend): allow answered toggle in update prayer request mutation"
```

---

### Task 4: Frontend — make the pill a working, inverting toggle

**Files:**
- Modify: `frontend/src/features/editPrayer/components/EditAnswered/EditAnswered.tsx` (full rewrite, currently 18 lines)
- Modify: `frontend/src/features/editPrayer/components/EditAnswered/EditAnswered.style.ts` (add states)
- Modify: `frontend/src/screens/EditPrayerScreen/EditPrayerScreen.tsx:68` (pass props)

**Interfaces:**
- Consumes: `useUpdatePrayerRequest` from Task 3, accepting
  `{ id: string; answered: boolean }`.
- Produces: `EditAnswered` takes
  `{ prayerId: string; status: PrayerRequestStatus }` — matching the prop
  style already used by `EditFrequncy` and `EditPrayerRequest`
  (`EditPrayerScreen.tsx:62-67`), where the screen owns the query and children
  are controlled.

**Color spec:** unanswered = white pill (`COLORS.primary`) with accent text and
icon (`COLORS.accent`). Answered = accent pill (`COLORS.accent`) with white
text and icon (`COLORS.primary`). The current style already has the white
background; the accent text color and both answered-state styles are new.

- [ ] **Step 1: Add the state styles**

In `EditAnswered.style.ts`, replace the `text` rule (lines 25-28) and append
the two new rules, so the exported object ends as:

```ts
  text: {
    ...fontFamily(800),
    color: COLORS.accent,
    fontSize: 17,
  },

  pillAnswered: {
    backgroundColor: COLORS.accent,
  },

  textAnswered: {
    color: COLORS.primary,
  },
});
```

Leave `container` and `pill` untouched. This mirrors the
`optionSelected` / `optionTextSelected` naming already used in
`EditFrequncy.styles.ts:43-55` — follow that convention rather than inventing
a new one.

- [ ] **Step 2: Rewrite the component**

Replace the entire contents of `EditAnswered.tsx` with:

```tsx
import { View, Text, Pressable } from 'react-native';

import { CheckCircle } from 'lucide-react-native';

import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

import { COLORS } from '@/constants';

import type { PrayerRequestStatus } from '@/types/prayerRequest';

import { styles } from './EditAnswered.style';

type EditAnsweredProps = {
  prayerId: string;
  status: PrayerRequestStatus;
};

const EditAnswered = ({ prayerId, status }: EditAnsweredProps) => {
  const { mutate, isPending } = useUpdatePrayerRequest();

  const isAnswered = status === 'answered';

  const toggle = () => {
    mutate({ id: prayerId, answered: !isAnswered });
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggle}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityState={{ selected: isAnswered, disabled: isPending }}
        style={[styles.pill, isAnswered && styles.pillAnswered]}
      >
        <CheckCircle
          size={24}
          color={isAnswered ? COLORS.primary : COLORS.accent}
        />
        <Text style={[styles.text, isAnswered && styles.textAnswered]}>
          {isAnswered ? 'Answered' : 'Mark As Answered'}
        </Text>
      </Pressable>
    </View>
  );
};

export default EditAnswered;
```

Two things worth understanding here:

- `CheckCircle` is an SVG icon, not text — it does not inherit `color` from the
  parent `Text` style the way web CSS would. Its color has to be passed as a
  prop, which is why `COLORS` is imported into the component file even though
  the rest of the styling lives in the stylesheet.
- `status` is read from the prop, never from local `useState`. The optimistic
  update in Task 3 already rewrites the cached `status`, so the screen re-renders
  with the new value on tap and there is no second source of truth to keep in sync.

- [ ] **Step 3: Pass the props from the screen**

In `frontend/src/screens/EditPrayerScreen/EditPrayerScreen.tsx`, replace
line 68:

```tsx
        <EditAnswered />
```

with:

```tsx
        <EditAnswered prayerId={id} status={prayer.status} />
```

- [ ] **Step 4: Typecheck and lint**

Run:

```bash
cd frontend && npx tsc --noEmit && npm run lint
```

Expected: no errors from any of the three files touched in this task.

- [ ] **Step 5: Verify in the app**

Run `cd frontend && npm run ios` (or `npm start` and open your simulator).
Navigate to any prayer request's Individual Prayer Screen and check all five:

1. Initially: white pill, accent (`#3D5A6C`) text and check icon, reading
   "Mark As Answered".
2. Tap it: the pill immediately turns accent with white text and icon, reading
   "Answered" — no perceptible delay, since the flip is optimistic.
3. Navigate back to Home and reopen the same request: it still shows the
   answered state (this proves the server persisted it, not just the cache).
4. Tap again: it inverts back to white/accent, "Mark As Answered".
5. Kill and relaunch the app, reopen the request: state matches whatever you
   left it in.

If step 3 fails but step 2 works, the UI is fine and the problem is in the
backend — re-run Task 2's curl checks.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/editPrayer/components/EditAnswered/EditAnswered.tsx \
        frontend/src/features/editPrayer/components/EditAnswered/EditAnswered.style.ts \
        frontend/src/screens/EditPrayerScreen/EditPrayerScreen.tsx
git commit -m "feat(frontend): mark prayer request as answered from edit screen"
```

---

### Task 5: Update the design doc to match the implemented contract

**Files:**
- Modify: `docs/system-design.md:109` (PATCH row), `:110` (POST answer row),
  `:156` (screen mapping), `:199` (Inbox → Active Deck rule)

**Interfaces:**
- Consumes: the shipped behavior from Tasks 1-4.
- Produces: a design doc that no longer describes an endpoint that does not
  exist. `CLAUDE.md` states the doc is the source of truth for endpoints and
  field names, so leaving it stale would mislead every later session.

- [ ] **Step 1: Update the PATCH row's request column**

On line 109, in the `PATCH | /prayers/:id` row, change the request-body cell
from:

```
any of `{ requestText, prayeeId, categoryId, frequencyType, recurringDays }`
```

to:

```
any of `{ requestText, prayeeId, categoryId, frequencyType, recurringDays, answered }`
```

- [ ] **Step 2: Replace the dedicated answer endpoint row**

Delete line 110 entirely — the `POST | /prayers/:id/answer` row. Marking
answered is a PATCH now, so no separate endpoint exists.

- [ ] **Step 3: Update the screen mapping**

On line 156, change:

```
- "Mark As Answered" → `POST /prayers/:id/answer`
```

to:

```
- "Mark As Answered" (toggle) → `PATCH /prayers/:id { answered: boolean }` —
  `true` sets `status=answered` + `answeredAt=now`; `false` clears `answeredAt`
  and re-derives status from prayee/category
```

- [ ] **Step 4: Note the exemption's one escape hatch**

On line 199, change:

```
  `answered` requests are exempt and never change status this way.
```

to:

```
  `answered` requests are exempt and never change status this way; the only way
  out of `answered` is an explicit `{ answered: false }` in the same PATCH,
  which re-applies the rule above.
```

- [ ] **Step 5: Verify no stale references remain**

Run:

```bash
grep -rn "prayers/:id/answer" docs/ backend/ frontend/src/
```

Expected: no output. Any hit is a reference to the endpoint that was never
built — fix it.

- [ ] **Step 6: Commit**

```bash
git add docs/system-design.md
git commit -m "docs: mark as answered is a PATCH toggle, not a dedicated endpoint"
```

---

## Notes for the reviewer

Two known limitations, both deliberate and out of scope:

- **The Home Screen has no "answered" tab yet.** Answering a request removes it
  from the Active Deck list (that query filters on `status=active`), and it
  becomes reachable only by direct link until an answered/history view exists.
  `docs/system-design.md:107` already anticipates
  `GET /prayers?status=answered` for this.
- **`totalAnswered` lifetime stat is untouched.** `docs/system-design.md:31`
  marks it "likely computed not stored", so it will pick up answered rows for
  free whenever the profile stats endpoint is built.
