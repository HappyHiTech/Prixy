# Prixy — System Design

## 1. Overview

Prixy lets a user capture prayer requests (by voice or manual text), organizes
them by prayee and category, and guides the user through a daily prayer
session ("Prayer Mode") against an "Active Deck" of requests. New requests
land in an **Inbox** for review/categorization before entering the Active
Deck. Users can mark requests as answered, which moves them to an answered
history used for lifetime stats.

Frontend: React Native (Expo)
Backend: AWS Lambda + API Gateway
Storage/DB: S3 (audio), Postgres/RDS (see Open Questions)
Auth: TBD (see Open Questions)
AI: AWS Transcribe (speech-to-text) + LLM call (cleanup, splitting, category
suggestion)

---

## 2. Data Model

### User

| Field          | Type        | Notes                                     |
| -------------- | ----------- | ----------------------------------------- |
| id             | string (PK) |                                           |
| displayName    | string      | editable on Profile Screen                |
| email          | string      |                                           |
| totalPrayedFor | int         | lifetime stat, likely computed not stored |
| totalAnswered  | int         | lifetime stat, likely computed not stored |
| createdAt      | timestamp   |                                           |

### Prayee

A lightweight, per-user "who am I praying for" entity — confirmed by the
"Praying For" picker, which lists previously used names for reuse rather than
free-typing every time.

| Field     | Type        | Notes             |
| --------- | ----------- | ----------------- |
| id        | string (PK) |                   |
| userId    | string (FK) |                   |
| name      | string      | e.g. "Harvey Tan" |
| createdAt | timestamp   |                   |

### Category

Per-user, with a set of defaults seeded on account creation, plus user-added
custom categories.

| Field     | Type        | Notes                              |
| --------- | ----------- | ---------------------------------- |
| id        | string (PK) |                                    |
| userId    | string (FK) |                                    |
| name      | string      | e.g. "Family", "Friends", "Church" |
| icon      | string      | icon identifier                    |
| isDefault | boolean     | true for the seeded starter set    |
| createdAt | timestamp   |                                    |

### PrayerRequest

The core entity.

| Field         | Type                                    | Notes                                                                  |
| ------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| id            | string (PK)                             |                                                                        |
| userId        | string (FK)                             |                                                                        |
| prayeeId      | string (FK, nullable)                   | null until assigned                                                    |
| categoryId    | string (FK, nullable)                   | null until assigned (Inbox cards show "Select a category")             |
| requestText   | string                                  | editable; starts as AI transcript or manual entry                      |
| rawTranscript | string (nullable)                       | original AI output before user edits, kept for reference               |
| status        | enum: `inbox` \| `active` \| `answered` | drives which tab/list it shows in                                      |
| sourceType    | enum: `voice` \| `manual`               |                                                                        |
| frequencyType | enum: `one_time` \| `recurring`         | from the "Set Frequency" picker                                        |
| recurringDays | array of enum (Mon–Sun)                 | populated only if `frequencyType = recurring`                          |
| lastPrayedAt  | timestamp (nullable)                    | used to compute today's prayed count and to re-surface recurring items |
| repeatOn      | date (nullable)                         | set by "repeat tomorrow" in Prayer Mode; due from this date until prayed again |
| answeredAt    | timestamp (nullable)                    | set when marked answered                                               |
| createdAt     | timestamp                               |                                                                        |

### Recording

Represents a raw voice capture, since one recording can be split by the AI
into multiple `PrayerRequest`s.

| Field                     | Type                                                                          | Notes                                      |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| id                        | string (PK)                                                                   |                                            |
| userId                    | string (FK)                                                                   |                                            |
| s3Key                     | string                                                                        | location of the uploaded audio             |
| transcriptRaw             | string (nullable)                                                             | full unprocessed transcript                |
| status                    | enum: `uploaded` \| `transcribing` \| `processing` \| `completed` \| `failed` | pipeline state                             |
| resultingPrayerRequestIds | array of string (FK)                                                          | the PrayerRequests this recording produced |
| createdAt                 | timestamp                                                                     |                                            |

---

## 3. API Contract

| Method | Path                       | Body                                                                            | Response                               | Notes                                                               |
| ------ | -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| POST   | `/recordings`              | —                                                                               | `{ recordingId, uploadUrl }`           | returns a presigned S3 URL for direct upload                        |
| GET    | `/recordings/:id`          | —                                                                               | `Recording` incl. status               | app can poll this while processing                                  |
| POST   | `/prayers`                 | `{ requestText, prayeeId?, categoryId?, frequencyType?, recurringDays? }`      | `PrayerRequest`                        | manual entry path; created on Save, not on opening the screen. `status` derived like PATCH (`active` if prayee + category set, else `inbox`) |
| POST   | `/prayers/capture`         | `{ text }`                                                                      | `PrayerRequest[]`                      | quick capture: LLM splits text, matches prayee/category — see `docs/quick-capture-spec.md` |
| GET    | `/prayers?status=inbox`    | —                                                                               | `PrayerRequest[]`                      | Home Screen "Inbox" tab                                             |
| GET    | `/prayers?status=active`   | —                                                                               | `PrayerRequest[]`                      | Home Screen "Active Deck" tab / Prayer Mode queue                   |
| GET    | `/prayers?status=answered` | —                                                                               | `PrayerRequest[]`                      | history/stats view                                                  |
| GET    | `/deck?tz=<IANA zone>`     | —                                                                               | `{ prayedToday, cards[] }`             | today's deck for Prayer Mode + Home header stats; cards are joined with prayee/category — see `docs/pray-mode-spec.md` |
| GET    | `/prayers/:id`             | —                                                                               | `PrayerRequest`                        | Individual Prayer Screen                                            |
| PATCH  | `/prayers/:id`             | any of `{ requestText, prayeeId, categoryId, frequencyType, recurringDays, answered }` | `PrayerRequest`                        | edits from Individual Prayer Screen or inline inbox category select; response `status` is derived, not sent — see Inbox → Active Deck rule. `answered: true` sets `status=answered` + `answeredAt=now`; `answered: false` clears `answeredAt` and re-derives status |
| POST   | `/prayers/:id/pray`        | `{ action: "done" \| "repeat_tomorrow", tz }`                                   | `PrayerRequest`                        | swipe right vs swipe left in Prayer Mode. Both set `lastPrayedAt=now`; `done` clears `repeatOn`, `repeat_tomorrow` sets it to the user's local tomorrow. `409` unless `active` — see `docs/pray-mode-spec.md` |
| GET    | `/prayees`              | —                                                                               | `Prayee[]`                          | populates "Praying For" picker                                      |
| POST   | `/prayees`              | `{ name }`                                                                      | `Prayee`                            | "Add a name"                                                        |
| GET    | `/categories`              | —                                                                               | `Category[]`                           | populates "Category" picker (defaults + custom)                     |
| POST   | `/categories`              | `{ name, icon }`                                                                | `Category`                             | "Add a Category"                                                    |
| DELETE | `/prayees/:id`             | —                                                                               | `204`                                  | X in "Praying For" sidebar; nulls `prayeeId` on that user's requests and demotes any orphaned `active` row to `inbox` |
| DELETE | `/categories/:id`          | —                                                                               | `204`                                  | X in "Category" sidebar; same nulling + demotion for `categoryId`. `409` when the category is `isDefault` |
| GET    | `/user/me`                 | —                                                                               | `User` incl. stats                     | Profile Screen                                                      |
| PATCH  | `/user/me`                 | `{ displayName }`                                                               | `User`                                 | Profile Screen edit                                                 |

---

## 4. AI Pipeline (voice → saved prayer request(s))

1. App requests a presigned upload URL — `POST /recordings`
2. App uploads audio directly to S3 (bypasses API Gateway payload limits)
3. S3 upload event triggers Lambda #1 → starts an AWS Transcribe job, sets
   `Recording.status = transcribing`
4. Transcribe completion event triggers Lambda #2 → sends the raw transcript
   to an LLM with a prompt to: (a) split it into one or more distinct prayer
   requests if multiple people/topics were mentioned in one recording, (b)
   clean up filler/false starts, (c) suggest a category per split request
5. Lambda #2 creates one `PrayerRequest` (status=`inbox`) per split item,
   links them via `Recording.resultingPrayerRequestIds`, sets
   `Recording.status = completed`
6. App polls or is notified the recording is done, refreshes the Inbox tab

**Text quick capture** enters this pipeline at step 4: the typed text takes the
place of the transcript. Steps 4–5 live in shared modules
(`backend/shared/capture/parseRequests.js` and `insertRequests.js`) used by both
`POST /prayers/capture` and, later, Lambda #2. The LLM is Claude Haiku 4.5 on
Amazon Bedrock, reached from the VPC through a `bedrock-runtime` interface
endpoint (no NAT gateway, no stored API key).

---

## 5. Screens → Data Mapping

**Home Screen (Inbox / Active Deck tabs)**

- Header stats: `GET /deck` (`prayedToday` → "Today", `cards.length` → "Deck")
- Inbox tab: `GET /prayers?status=inbox` — each card shows `requestText` +
  a category selector (`PATCH /prayers/:id`)
- Active Deck tab: `GET /prayers?status=active`
- "+" button → Record or Manual → `POST /recordings` or `POST /prayers`
  **Individual Prayer Screen**
- `GET /prayers/:id`
- Prayee chip → opens "Praying For" picker (`GET`/`POST`/`DELETE /prayees`,
  then `PATCH /prayers/:id`)
- Category chip → opens "Category" picker (`GET`/`POST`/`DELETE /categories`,
  then `PATCH /prayers/:id`)
- Editable request text → `PATCH /prayers/:id`
- "Set Frequency" (One time / Mon–Sun) → `PATCH /prayers/:id`
- "Mark As Answered" (toggle) → `PATCH /prayers/:id { answered: boolean }` —
  `true` sets `status=answered` + `answeredAt=now`; `false` clears `answeredAt`
  and re-derives status from prayee/category
  **Prayer Mode**
- Queue: `GET /deck` (today's due requests, not every active request)
- Swipe right (prayed) → `POST /prayers/:id/pray { action: "done" }`
- Swipe left (prayed + repeat tomorrow) →
  `POST /prayers/:id/pray { action: "repeat_tomorrow" }`
  **Profile Screen**
- `GET /user/me`, `PATCH /user/me`
- Lifetime stats ("Total Requests Prayed For", "Total Prayers Answered")
  come from the same `GET /user/me` payload
  **Auth Screen**
- TBD — see Open Questions

---

## 6. Non-goals (v1)

- Push notifications (recurring items land in the Active Deck automatically;
  no notification is sent yet)
- Offline support (AI transcription/summarization requires connectivity
  anyway, and offline sync adds real complexity — deferred)
- LangChain / RAG / agent features (current pipeline is single LLM calls;
  see earlier discussion — revisit if "Prayer Journey" or duplicate-detection
  features get built)
- Semantic duplicate-request detection
- Category/prayee merging or AI-driven taxonomy cleanup

---

## 7. Open Questions

- **Active Deck selection**: **resolved** — a daily deck, computed server-side
  for the user's local date: `active` requests not yet prayed today that are
  one-time and never prayed, recurring on today's weekday, or have
  `repeatOn <= today`. Random order, grouped by prayee. See
  `docs/pray-mode-spec.md`.
- **Database**: Postgres/RDS vs DynamoDB — leaning relational given the
  Prayee/Category/PrayerRequest relationships, pricing to be confirmed
  (see below)
- **Auth provider/method**: Cognito vs third-party, and which sign-in
  methods (email/password, social) — still researching
- **Inbox → Active Deck transition**: **resolved** — a request is `active`
  exactly when both `prayeeId` and `categoryId` are non-null, and returns to
  `inbox` if either is cleared. `frequencyType` is not part of the rule.
  Derived server-side in `POST /prayers` and `PATCH /prayers/:id`, never by the client.
  `answered` requests are exempt and never change status this way; the only way
  out of `answered` is an explicit `{ answered: false }` in the same PATCH,
  which re-applies the rule above.
  `DELETE /prayees/:id` and `DELETE /categories/:id` re-apply the rule
  explicitly after the `ON DELETE SET NULL` cascade, demoting any `active`
  row left with a null id back to `inbox`. Postgres cascades do not re-run
  the rule on their own, so any future path that deletes a prayee or category
  must do the same.
- **AI-matched requests**: **resolved** — requests created by quick capture
  follow the same rule. The LLM sets `prayeeId`/`categoryId` only on a clear
  match, so a fully matched request goes straight to `active` and anything
  uncertain lands in `inbox`.
- **Raw capture input**: **resolved** — the user's typed text is not stored.
  `rawTranscript` holds the AI's cleaned text per request.
- **`...` menu on Inbox cards**: contents not yet defined (likely delete /
  edit / move to Active Deck manually)
- **"One time" vs recurring semantics**: **resolved** — `one_time` appears in
  the deck until prayed once, then never again (it stays `active` until
  answered). `recurring` appears on its `recurringDays` only; missed days
  don't catch up.
