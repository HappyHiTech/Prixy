# Prixy — AI Assistant Context

Read this before making changes. It captures decisions already made so they
don't get re-litigated or guessed wrong in every new session.

## What this app does

Prixy captures prayer requests (by voice or manual text), organizes them by
recipient and category, and guides the user through daily prayer sessions
against an "Active Deck." New requests land in an Inbox for review before
entering the Active Deck. See `docs/system-design.md` for full detail.

## Purpose of This Project & How to Help Me

This project exists for me to **learn** — industry-standard practices, React
Native/Expo in depth, and AWS (Lambda, API Gateway, RDS, S3, etc.) which is
mostly new to me, though I already know standard React. The finished app
matters less than whether I understand it front to back by the end.

Because of that:

- Default to **teaching, not just delivering**. Explain the "why" behind a
  suggestion (why this AWS service, why this pattern), not just the "what."
- Prefer walking me through implementation over silently doing it for me,
  unless I explicitly ask you to just build something.
- If I have a `/writing-implementation-guide` skill available, that's the
  right mode for "help me add X" style requests: it produces a step-by-step
  guide I follow by hand (real code, real file paths, explanations only
  where I'd genuinely guess wrong) rather than writing the code itself.
  Prefer it over silently implementing when I'm asking to learn a piece,
  not just get it done.
- It's fine to be direct about tradeoffs and push back on premature
  complexity (see `Do Not` below for examples already settled) — that's
  part of the learning, not something to soften.

## Tech Stack

- **Frontend:** React Native via Expo
- **Backend:** AWS Lambda (Node.js) + API Gateway
- **Database:** AWS RDS / PostgreSQL (chosen over DynamoDB — data model is
  relational: User → PrayerRequest → Recipient/Category)
- **File storage:** S3 (voice recordings)
- **AI pipeline:** AWS Transcribe (speech-to-text) + a single LLM API call
  (Claude/GPT) for transcript cleanup, splitting multi-topic recordings into
  separate requests, and category suggestion
- **Auth:** not yet decided (Cognito vs. third-party) — do not assume one is
  wired up

## Repo Structure

```
Prixy/
├── frontend/
│   └── src/
│       ├── app/             - Expo Router route files ONLY (thin — see below)
│       ├── features/        - feature-based folders (see below)
│       └── components/      - truly shared/generic UI (Button, Modal, etc.)
├── backend/
│   ├── functions/       - one folder per Lambda, e.g. functions/createPrayer/
│   ├── shared/          - shared DB client, utils used across functions
│   └── infra/           - infrastructure as code (SAM/Serverless config)
├── docs/
│   ├── system-design.md - data model, API contract, screens mapping
└── CLAUDE.md            - this file
```

New Lambda functions go in `backend/functions/<name>/`. Shared logic (DB
connection, auth helpers) goes in `backend/shared/`, not duplicated per
function.

### Frontend structure: thin routes + feature folders

Everything lives under `frontend/src/` (the Expo template's default layout —
kept as-is rather than flattened to `frontend/app/`). Expo Router makes
`frontend/src/app/` a router, not a free-form folder — file paths there map
directly to routes. Keep files in `app/` thin: import and render a screen
component from `features/`, wire up route params, nothing more. All real
logic goes in `frontend/src/features/<feature>/`, one folder per feature
(e.g. `prayers/`, `recipients/`, `categories/`, `profile/`), each containing
its own `components/`, `hooks/`, `store/`, and `api.ts`. Don't put business
logic, data fetching, or substantial UI directly in an `app/` route file —
route files should stay small enough to read at a glance.

The `@/*` TS path alias points at `frontend/src/*` — new code under
`src/features/` or `src/components/` uses `@/features/...` / `@/components/...`
imports like the rest of the app, not relative paths.

## Data Model & API — see docs/system-design.md

Do not invent field names or endpoints. Core entities: `User`, `Recipient`,
`Category`, `PrayerRequest`, `Recording`. `PrayerRequest.status` is one of
`inbox` / `active` / `answered`. Full field lists and the API route table
live in `docs/system-design.md` — check it before writing backend code that
touches these entities.

## Current Focus

Building frontend UI screens against mock/hardcoded data. No backend is
wired up yet. Do not assume API calls, auth, or a live database exist until
this section is updated to say otherwise.

## Do Not

- Do not add LangChain, RAG, or agent frameworks for features that are a
  single LLM call with one input/output (e.g. transcript cleanup). Revisit only for genuinely multi-step
  features (e.g. a future "Prayer Journey" summary, duplicate-request
  detection).
- Do not add push notifications — recurring items auto-add to the Active
  Deck, no notification is sent (v1 non-goal).
- Do not add offline support — the app assumes connectivity (v1 non-goal,
  since AI transcription requires it anyway).
- Do not add features not in `docs/system-design.md` without flagging that
  the doc needs updating first.

## Conventions

(To be filled in as they're established — e.g. Lambda handler shape, API
response format, naming case. Keep this section updated as real patterns
emerge in the code rather than prescribing them upfront.)

## Setup

(To be filled in once local dev / deploy tooling is chosen — e.g. how to run
the Expo app, how to deploy a Lambda function.)
