# Pray Mode — Technical Specification

**Status:** Approved design, not yet implemented
**Branch:** `feat/prayMode`
**Date:** 2026-10-04

---

## 1. Summary

Pray Mode shows the user a swipe deck of the prayer requests that are due
today. Swiping right means "prayed". Swiping left means "prayed, and bring it
back tomorrow". The UI already exists as a mockup on `UI/prayMode`
(`SwipeDeck`, `DeckCard`, `DeckComplete`, `PrayScreen`) and runs on
`MOCK_PRAYERS`. This spec replaces the mock data with a real deck from the
server and saves each swipe.

The main new idea is **today's deck**. It is not "every active request". It is
a daily selection of active requests, computed by the server for the user's
local date.

---

## 2. Decisions

| # | Decision | Why |
| - | -------- | --- |
| D1 | **Deck rule.** A request is in today's deck when it is `status = 'active'`, has **not been prayed today**, and at least one of these is true: (a) `one_time` and never prayed (`last_prayed_at IS NULL`); (b) `recurring` and today's weekday is in `recurring_days`; (c) `repeat_on <= today`. | (a) also catches one-time requests the user never reached. "Made today" alone would lose a request created on a day Pray Mode wasn't opened, or one that sat in the Inbox before it was categorized. |
| D2 | **A one-time request leaves the deck for good once it is prayed.** It keeps `status = 'active'` (still visible on Home's Active Deck tab) until it is marked answered. | "One time" means exactly that. A later feature may let the user re-queue a request from the edit screen; that is out of scope here. |
| D3 | **Recurring means "on its days".** A Mon/Thu request is due Mondays and Thursdays only. Missed days do not catch up. | A missed Monday shouldn't pile up into Tuesday's deck. |
| D4 | **"Repeat tomorrow" sets a new `repeat_on date` column** to the user's local tomorrow. The request stays due from that day until it is prayed again (`repeat_on <= today`). Any swipe clears or resets it. | `date` rather than `timestamptz` because "tomorrow" is a calendar day in the user's timezone, not an instant. Carry-over matches D1(a): nothing the user asked to see again silently disappears. |
| D5 | **"Today" is the phone's IANA timezone, resolved in Postgres.** The client sends `tz` (for example `America/Los_Angeles`). SQL computes `(now() AT TIME ZONE $tz)::date`. | Lambda runs in UTC. Sending the zone name (not a date) means the server uses its own clock and the one parameter gives the local date, the weekday, and "prayed today". |
| D6 | **Dedicated `GET /deck` endpoint** that returns cards already joined with prayee and category, plus `prayedToday`. | The deck rule lives in one place, on the server. Overloading `GET /prayers` would mix a plain list (ordered by `created_at`) with a joined, shuffled selection. Filtering on the phone would duplicate the rule in every client. |
| D7 | **`GET /deck` replaces the planned `GET /stats/today`.** Home's "Today: N / Deck: N" reads the same query. | One fewer endpoint, and the two numbers can never disagree with the deck. |
| D8 | **"Today: N" = requests whose `last_prayed_at` is on today's local date.** No prayer-event log table. | Each request can be swiped at most once per day (D1), so the timestamp is enough. A lifetime "Total Prayed For" stat would need an event log; that belongs to the Profile feature. |
| D9 | **Order: random, with each prayee's requests kept together.** One random key per prayee, then a random order within the group. | Praying through one person's requests back-to-back reads naturally; shuffling keeps the deck from feeling identical every day. |
| D10 | **The deck is not refetched during a session.** A swipe removes the card from the cached deck immediately (optimistic update) and sends the POST. | The server reshuffles on every fetch. Refetching after each swipe would reorder the cards under the user's thumb. |
| D11 | **Praying a request that isn't `active` returns `409`.** | Inbox and answered requests never appear in the deck, so a pray call for one is a stale client or a bug. |

---

## 3. Architecture

```
PrayScreen (tab focus)
  │
  ▼
GET /deck?tz=America/Los_Angeles ──► GetDeckFunction ──► RDS
  ◄── { prayedToday, cards[] }         (deck rule + joins + grouped shuffle)
  │
  │  user swipes a card
  ▼
remove card from cached deck, prayedToday + 1      (optimistic)
  │
  ▼
POST /prayers/{id}/pray { action, tz } ──► PrayPrayerFunction ──► RDS
  ◄── PrayerRequest                         (sets last_prayed_at, repeat_on)
  │
  ├─ success: invalidate ['prayerRequests'] (lastPrayedAt changed)
  └─ error:   put the card back on top, alert the user
```

---

## 4. Schema

New migration `backend/functions/ops/migrate/sql/005_repeat_on.sql`:

```sql
-- 005_repeat_on.sql
-- "Repeat tomorrow" in Pray Mode. Safe to run repeatedly.

ALTER TABLE prayer_requests
  ADD COLUMN IF NOT EXISTS repeat_on date;
```

The migrate Lambda re-runs every file on each invocation, so `IF NOT EXISTS`
is required. No new index: the deck query filters on `(user_id, status)`,
which `prayer_requests_user_status_idx` already covers.

---

## 5. API contract

### `GET /deck`

Query: `tz` (required): an IANA timezone name.

Response `200`:

```json
{
  "prayedToday": 3,
  "cards": [
    {
      "id": "uuid",
      "requestText": "Healing after her knee surgery.",
      "frequencyType": "recurring",
      "createdAt": "2026-10-02T17:04:11.000Z",
      "prayeeId": "uuid",
      "prayeeName": "Mom",
      "categoryId": "uuid",
      "categoryName": "Health",
      "categoryIcon": "stethoscope"
    }
  ]
}
```

The cards are flat, matching the shape `DeckCard` already renders. The client
derives "days ago" from `createdAt`. The deck count is `cards.length`.

Errors: `401` no Cognito `sub`; `400` missing or invalid `tz`; `500` DB error.

### `POST /prayers/{id}/pray`

Body: `{ "action": "done" | "repeat_tomorrow", "tz": "America/Los_Angeles" }`

| action            | `last_prayed_at` | `repeat_on`         |
| ----------------- | ---------------- | ------------------- |
| `done`            | `now()`          | `NULL`              |
| `repeat_tomorrow` | `now()`          | local today + 1 day |

Response `200`: the updated `PrayerRequest`, including the new `repeatOn`
field (`"YYYY-MM-DD"` or `null`).

Errors: `401` no `sub`; `400` invalid id, action, or `tz`; `404` the request
doesn't exist or isn't the caller's; `409` the request isn't `active`.

Retrying is harmless: running the same call twice leaves the same state.

---

## 6. Backend

### 6.1 File layout

```
backend/
├── functions/
│   ├── deck/get/            index.js, package.json, Makefile   (new)
│   └── prayers/pray/        index.js, package.json, Makefile   (new)
├── shared/
│   ├── timeZone.js          isValidTimeZone(tz)                 (new)
│   └── timeZone.test.js                                         (new)
└── infra/template.yaml      GetDeckFunction, PrayPrayerFunction (edit)
```

Both handlers follow the existing shape (see `functions/prayers/list/index.js`):
read `event.requestContext.authorizer.claims.sub`, scope every query by joining
`users` on `cognito_sub`, use `withClient` from `shared/db`, and return JSON
bodies with `{ message }` on errors. `package.json` and `Makefile` copy
`functions/prayers/get/`, with the Makefile target renamed to the new logical
ID (`build-GetDeckFunction`, `build-PrayPrayerFunction`).

### 6.2 `shared/timeZone.js`

```js
// Intl throws a RangeError for unknown zones, so a bad tz is rejected with a
// 400 here instead of surfacing as a Postgres error.
const isValidTimeZone = (tz) => {
  if (typeof tz !== "string" || tz.length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};
```

It also rejects strings that start with `+` or `-`. Intl may accept an offset
like `+05:00`, but Postgres reads a bare offset in POSIX style with the sign
**flipped**, so `+05:00` would quietly mean UTC−5. Phones report IANA names,
so nothing real is lost.

`repeat_on` is selected as `repeat_on::text`. Without the cast, `pg` turns a
`date` into a JS `Date` at UTC midnight, and it serializes as
`2026-10-05T00:00:00.000Z` instead of `2026-10-05`.

### 6.3 `GetDeckFunction` — the deck query

`$1` = cognito sub, `$2` = tz.

```sql
WITH me AS (
  SELECT id FROM users WHERE cognito_sub = $1
),
today AS (
  SELECT (now() AT TIME ZONE $2)::date AS d
),
due AS (
  SELECT pr.*
  FROM prayer_requests pr
  JOIN me ON pr.user_id = me.id
  CROSS JOIN today
  WHERE pr.status = 'active'
    AND (pr.last_prayed_at IS NULL
         OR (pr.last_prayed_at AT TIME ZONE $2)::date < today.d)
    AND (
      (pr.frequency_type = 'one_time' AND pr.last_prayed_at IS NULL)
      OR (pr.frequency_type = 'recurring'
          AND to_char(today.d, 'Dy') = ANY (pr.recurring_days))
      OR pr.repeat_on <= today.d
    )
),
prayee_order AS (
  SELECT prayee_id, random() AS k
  FROM (SELECT DISTINCT prayee_id FROM due) g
)
SELECT
  due.id,
  due.request_text   AS "requestText",
  due.frequency_type AS "frequencyType",
  due.created_at     AS "createdAt",
  p.id               AS "prayeeId",
  p.name             AS "prayeeName",
  c.id               AS "categoryId",
  c.name             AS "categoryName",
  c.icon             AS "categoryIcon"
FROM due
JOIN prayee_order po ON po.prayee_id = due.prayee_id
JOIN prayees p       ON p.id = due.prayee_id
JOIN categories c    ON c.id = due.category_id
ORDER BY po.k, random();
```

Notes:

- Inner joins are safe: an `active` request always has both `prayee_id` and
  `category_id` (the Inbox → Active rule in `system-design.md`).
- `to_char(d, 'Dy')` returns `Mon`…`Sun` in English (no `TM` prefix, so it
  ignores locale). Those are exactly the values `recurring_days` stores.
- The rows match D1 even when more than one branch applies (for example, a
  recurring request that was also swiped "tomorrow"). `OR` doesn't duplicate rows.

`prayedToday`, run in the same `withClient` call:

```sql
SELECT count(*)::int AS "prayedToday"
FROM prayer_requests pr
JOIN users u ON u.id = pr.user_id
WHERE u.cognito_sub = $1
  AND (pr.last_prayed_at AT TIME ZONE $2)::date = (now() AT TIME ZONE $2)::date;
```

This counts every status, so a request prayed today and then marked answered
still counts.

### 6.4 `PrayPrayerFunction`

Validate `id` with the same `UUID_PATTERN` used elsewhere, `action` against
`["done", "repeat_tomorrow"]`, and `tz` with `isValidTimeZone`.

`$1` sub, `$2` id, `$3` action, `$4` tz:

```sql
UPDATE prayer_requests pr
SET last_prayed_at = now(),
    repeat_on = CASE WHEN $3 = 'repeat_tomorrow'
                     THEN (now() AT TIME ZONE $4)::date + 1
                     ELSE NULL END
FROM users u
WHERE pr.user_id = u.id
  AND u.cognito_sub = $1
  AND pr.id = $2
  AND pr.status = 'active'
RETURNING pr.*;  -- aliased to camelCase like the other handlers, plus repeat_on::text AS "repeatOn"
```

If no row comes back, run
`SELECT pr.status FROM prayer_requests pr JOIN users u ... WHERE pr.id = $2 AND u.cognito_sub = $1`.
No row → `404`. Row found (so it isn't active) → `409`.

### 6.5 Infrastructure (`template.yaml`)

Two functions, copied from `GetPrayerFunction` (same `MemorySize`,
`VpcConfig`, `Environment`, `Policies` anchors, `CognitoAuth` authorizer):

| Logical ID           | CodeUri                       | Path                  | Method |
| -------------------- | ----------------------------- | --------------------- | ------ |
| `GetDeckFunction`    | `../functions/deck/get/`      | `/deck`               | get    |
| `PrayPrayerFunction` | `../functions/prayers/pray/`  | `/prayers/{id}/pray`  | post   |

---

## 7. Frontend

### 7.1 Types: `src/types/deck.ts` (new)

```ts
import type { PrayerRequestFrequencyType } from '@/types/prayerRequest';

// Named DeckPrayer, not DeckCard, so it doesn't collide with the DeckCard
// component that renders it.
export type DeckPrayer = {
  id: string;
  requestText: string;
  frequencyType: PrayerRequestFrequencyType;
  createdAt: string;
  prayeeId: string;
  prayeeName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
};

export type Deck = { prayedToday: number; cards: DeckPrayer[] };

export type PrayAction = 'done' | 'repeat_tomorrow';
```

Also add `repeatOn: string | null` to `PrayerRequest` in
`src/types/prayerRequest.ts`.

### 7.2 Time zone helper: `src/utils`

`getTimeZone()` returns `Intl.DateTimeFormat().resolvedOptions().timeZone`.
Hermes supports this on both iOS and Android.

### 7.3 API: `src/apis/deck.api.ts` (new)

- `fetchDeck(): Promise<Deck>` → `GET /deck?tz=${encodeURIComponent(getTimeZone())}`
- `prayPrayerRequest(id, action): Promise<PrayerRequest>` →
  `POST /prayers/${id}/pray` with `{ action, tz: getTimeZone() }`

Both use the existing `apiFetch` from `apiClient.ts`.

### 7.4 Hooks: `src/hooks/TanStack/deck/` (new)

- `useDeckQuery()`: key `['deck']`.
- `usePrayMutation()`:
  - `onMutate`: cancel `['deck']`, snapshot it, remove the card from `cards`,
    and add 1 to `prayedToday`.
  - `onError`: restore the snapshot (the card returns to the top) and show an
    `Alert` ("Couldn't save that prayer. Try again.").
  - `onSettled`: invalidate `['prayerRequests']` only. **Not `['deck']`** (D10).

Other mutations that change what is due must invalidate `['deck']` in their
`onSettled`: create, capture, update (category/prayee/frequency/answered), and
delete prayer request, plus delete prayee and delete category (both can demote
requests to `inbox`). The user is on another screen when these run, so a
reshuffle there is harmless.

### 7.5 `PrayScreen`

- Reads `useDeckQuery()`. Removes the local `queue` / `prayedCount` state and the
  `MOCK_PRAYERS` import.
- Refetches `['deck']` in the existing `useFocusEffect`, so a new day (or edits
  made on other tabs) show up when the user returns to the tab.
- Keeps a session-local `againCount` for the `DeckComplete` message.
- Maps the swipe decision to the API action: `'prayed'` → `'done'`,
  `'again'` → `'repeat_tomorrow'`.
- Progress bar: `prayedToday / (prayedToday + cards.length)`. That stays
  correct across app restarts within the same day.
- States:
  - loading → a centered `ActivityIndicator`
  - error → a message and a retry button (`refetch`)
  - `cards.length === 0 && prayedToday === 0` → "Nothing due today" (new empty state)
  - `cards.length === 0 && prayedToday > 0` → `DeckComplete`
  - otherwise → `SwipeDeck`

### 7.6 Components

- `SwipeDeck` / `DeckCard`: replace `MockPrayer` with `DeckPrayer` from
  `@/types/deck`. `DeckCard` computes the days-ago label from `createdAt`.
  Use calendar days, not 24-hour blocks, so a request made at 11pm yesterday
  reads `1d`, not `Today`.
- `DeckComplete`: remove the "Restart mock deck" button and the `onRestart` prop.
  When `prayedCount === 0` it renders the "Nothing due today" empty state
  (same layout, different copy), so there is no separate component.
- `StatsCard`: read `useDeckQuery()` for both numbers
  (`Today: prayedToday`, `Deck: cards.length`). Remove the mock props and the
  `usePrayerRequests('active')` fallback. Home's "Deck" now means "due today",
  not "all active".
- Delete `src/features/pray/mockPrayers.ts`.

---

## 8. Error handling summary

| Situation | Behavior |
| --------- | -------- |
| Invalid `tz` | `400`, before any query runs |
| Deck fetch fails | Pray screen shows an error with a retry button |
| Pray POST fails | Card is restored to the top of the deck, `prayedToday` rolls back, alert shown |
| Request was answered/edited elsewhere, then swiped | `409`; handled like any failed POST. The next focus refetch drops the card |
| Request deleted elsewhere, then swiped | `404`; same handling |
| Network retry sends the same POST twice | Same end state (idempotent) |

---

## 9. Testing

### 9.1 Unit tests (`node:test`, no new dependencies)

`backend/shared/timeZone.test.js`: valid zone, unknown zone, empty string,
non-string.

### 9.2 Deck rule against the real database

Use the `ops/query` Lambda (or `psql`) with rows set up for each case, then
call `GET /deck`. Expected in today's deck:

| Row | Expected |
| --- | -------- |
| active, one_time, never prayed, created a week ago | in |
| active, one_time, prayed yesterday | out (D2) |
| active, recurring, today's weekday listed, prayed yesterday | in |
| active, recurring, today's weekday listed, prayed today | out |
| active, recurring, today's weekday **not** listed | out |
| active, one_time, prayed yesterday, `repeat_on` = today | in |
| active, any, `repeat_on` = 3 days ago, not prayed since | in (D4 carry-over) |
| active, `repeat_on` = tomorrow | out |
| inbox or answered, otherwise due | out |
| another user's due request | out |

Timezone check: with a recurring row due today whose `last_prayed_at` is 02:00 UTC today, call
with `tz=America/Los_Angeles` (still "yesterday" locally, so it counts as not
prayed today) and with `tz=UTC` (prayed today).

### 9.3 Manual end-to-end (after `sam build && sam deploy`)

1. Open Pray, check that the deck matches 9.2 and the cards are grouped by prayee.
2. Swipe right, kill the app, reopen: card gone, "Today" incremented.
3. Swipe left: card gone today. Then `UPDATE ... SET last_prayed_at = now() - interval '1 day', repeat_on = current_date`
   to simulate tomorrow, and refocus: it's back.
4. Turn on airplane mode and swipe: the card comes back with an alert.
5. Categorize an Inbox item on Home, switch to Pray: it's in the deck.

---

## 10. Documentation updates (do before writing code)

In `docs/system-design.md`:

- Data model: add `repeatOn | date (nullable) | set by "repeat tomorrow" in Pray Mode; due from this date until prayed`.
- API table: add `GET /deck` and fill in `POST /prayers/:id/pray` with `tz`
  and the field effects. Remove `GET /stats/today`.
- Screens: Home header stats and Prayer Mode queue → `GET /deck`.
- Open Questions: mark **Active Deck selection** resolved (link this spec);
  mark **"One time" vs recurring semantics** resolved per D2/D3.

---

## 11. Branch setup

`feat/prayMode` currently stops at `5de082a` and doesn't have the mockup
commits (`d5f10c2`, `7fd6b21`) or the uncommitted UI changes on `UI/prayMode`.
Commit those on `UI/prayMode` first, then merge `UI/prayMode` into
`feat/prayMode` and build there.

---

## 12. Out of scope

- Lifetime "Total Prayed For" stat and a prayer-event log (D8)
- Re-queueing a prayed one-time request from the edit screen (D2)
- Undoing a swipe
- Catching up missed recurring days (D3)
- Handling a user who changes timezone mid-day (they may see a request twice
  or miss it once on that day)
- Push notifications, offline support (v1 non-goals)
