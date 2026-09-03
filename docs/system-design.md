# Prixy — System Design

## 1. Overview

Prixy lets a user capture prayer requests (by voice or manual text), organizes
them by recipient and category, and guides the user through a daily prayer
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

### Recipient

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
| recipientId   | string (FK, nullable)                   | null until assigned                                                    |
| categoryId    | string (FK, nullable)                   | null until assigned (Inbox cards show "Select a category")             |
| requestText   | string                                  | editable; starts as AI transcript or manual entry                      |
| rawTranscript | string (nullable)                       | original AI output before user edits, kept for reference               |
| status        | enum: `inbox` \| `active` \| `answered` | drives which tab/list it shows in                                      |
| sourceType    | enum: `voice` \| `manual`               |                                                                        |
| frequencyType | enum: `one_time` \| `recurring`         | from the "Set Frequency" picker                                        |
| recurringDays | array of enum (Mon–Sun)                 | populated only if `frequencyType = recurring`                          |
| lastPrayedAt  | timestamp (nullable)                    | used to compute today's prayed count and to re-surface recurring items |
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
| POST   | `/prayers`                 | `{ requestText, recipientId?, categoryId? }`                                    | `PrayerRequest`                        | manual entry path                                                   |
| GET    | `/prayers?status=inbox`    | —                                                                               | `PrayerRequest[]`                      | Home Screen "Inbox" tab                                             |
| GET    | `/prayers?status=active`   | —                                                                               | `PrayerRequest[]`                      | Home Screen "Active Deck" tab / Prayer Mode queue                   |
| GET    | `/prayers?status=answered` | —                                                                               | `PrayerRequest[]`                      | history/stats view                                                  |
| GET    | `/prayers/:id`             | —                                                                               | `PrayerRequest`                        | Individual Prayer Screen                                            |
| PATCH  | `/prayers/:id`             | any of `{ requestText, recipientId, categoryId, frequencyType, recurringDays }` | `PrayerRequest`                        | edits from Individual Prayer Screen or inline inbox category select |
| POST   | `/prayers/:id/answer`      | —                                                                               | `PrayerRequest`                        | sets `status=answered`, `answeredAt=now`                            |
| POST   | `/prayers/:id/pray`        | `{ action: "done" \| "repeat_tomorrow" }`                                       | `PrayerRequest`                        | swipe right vs swipe left in Prayer Mode                            |
| GET    | `/recipients`              | —                                                                               | `Recipient[]`                          | populates "Praying For" picker                                      |
| POST   | `/recipients`              | `{ name }`                                                                      | `Recipient`                            | "Add a name"                                                        |
| GET    | `/categories`              | —                                                                               | `Category[]`                           | populates "Category" picker (defaults + custom)                     |
| POST   | `/categories`              | `{ name, icon }`                                                                | `Category`                             | "Add a Category"                                                    |
| GET    | `/user/me`                 | —                                                                               | `User` incl. stats                     | Profile Screen                                                      |
| PATCH  | `/user/me`                 | `{ displayName }`                                                               | `User`                                 | Profile Screen edit                                                 |
| GET    | `/stats/today`             | —                                                                               | `{ prayedToday: int, deckCount: int }` | Home Screen header ("Today: 0", "Deck: 5")                          |

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

---

## 5. Screens → Data Mapping

**Home Screen (Inbox / Active Deck tabs)**

- Header stats: `GET /stats/today`
- Inbox tab: `GET /prayers?status=inbox` — each card shows `requestText` +
  a category selector (`PATCH /prayers/:id`)
- Active Deck tab: `GET /prayers?status=active`
- "+" button → Record or Manual → `POST /recordings` or `POST /prayers`
  **Individual Prayer Screen**
- `GET /prayers/:id`
- Recipient chip → opens "Praying For" picker (`GET`/`POST /recipients`,
  then `PATCH /prayers/:id`)
- Category chip → opens "Category" picker (`GET`/`POST /categories`, then
  `PATCH /prayers/:id`)
- Editable request text → `PATCH /prayers/:id`
- "Set Frequency" (One time / Mon–Sun) → `PATCH /prayers/:id`
- "Mark As Answered" → `POST /prayers/:id/answer`
  **Prayer Mode**
- Queue: `GET /prayers?status=active`
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
- Category/recipient merging or AI-driven taxonomy cleanup

---

## 7. Open Questions

- **Active Deck selection**: does everything with `status=active` show up
  every day, or does an algorithm rotate a subset in? (undecided — noted in
  the `Active Deck` glossary entry as "there will be an algorithm for this")
- **Database**: Postgres/RDS vs DynamoDB — leaning relational given the
  Recipient/Category/PrayerRequest relationships, pricing to be confirmed
  (see below)
- **Auth provider/method**: Cognito vs third-party, and which sign-in
  methods (email/password, social) — still researching
- **Inbox → Active Deck transition**: what actually triggers a request
  moving from `inbox` to `active`? (e.g., does assigning a category alone do
  it, or does it require recipient + category + frequency all set?) — not
  yet defined by the mockups, needs a decision
- **`...` menu on Inbox cards**: contents not yet defined (likely delete /
  edit / move to Active Deck manually)
- **"One time" vs recurring semantics**: does `one_time` mean the request
  enters the Active Deck once and never recurs, while `recurring` + selected
  days means it re-enters on those weekdays going forward? Assumed yes above,
  worth confirming against intended UX
