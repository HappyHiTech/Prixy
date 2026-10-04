# Once → Pray Again Implementation Plan

**Goal:** A `one_time` prayer request that was swiped right ("done") silently
drops out of the deck forever. Show that state on the Edit Prayer screen's
"Once" cell, and let the user tap "Once" to put it back in the deck.

**Design (approved in chat, Option B):** the indicator and the action both
live on the existing "Once" cell in `EditFrequncy`. No new buttons.

**Spec:** none written (bounded change, design approved in chat). This plan
is the authority.

## Global Constraints

- **Dormant** means exactly: `status === 'active'` AND
  `frequencyType === 'one_time'` AND `lastPrayedAt !== null` AND
  `repeatOn === null`. Computed client-side from the `PrayerRequest`
  already fetched by `usePrayerRequestByIdQuery`. No new endpoint, no new
  response field.
- Re-arming is done through the existing `PATCH /prayers/:id` by sending
  `repeatOn: "<YYYY-MM-DD local today>"`. The `repeat_on` column already
  exists; **no migration**, **no change to the deck query**.
- `lastPrayedAt` is never cleared by this feature (clearing it would
  decrement the user's "Today" count).
- Because the deck excludes rows prayed today, a request re-armed on the
  same day it was prayed reappears **tomorrow**; otherwise **today**. The UI
  label must say which.
- Re-arming is a **draft change**, applied only when the user presses Save,
  like every other field on the Edit screen.
- Frontend imports use the `@/` alias. Match surrounding code style (2-space,
  single quotes in frontend; double quotes in backend JS).
- Backend error response shape is unchanged:
  `{ statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }`.

---

### Task 1: Backend — PATCH accepts `repeatOn`, plus docs

**Files:**
- Create: `backend/shared/isIsoDate.js`
- Create: `backend/shared/isIsoDate.test.js`
- Modify: `backend/functions/prayers/update/index.js`
- Modify: `docs/system-design.md`

**1a. `backend/shared/isIsoDate.js`** — pure validator, CommonJS:

```js
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// True for a "YYYY-MM-DD" string naming a real calendar date.
const isIsoDate = (value) => {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

module.exports = { isIsoDate };
```

**1b. `backend/shared/isIsoDate.test.js`** — `node:test` + `node:assert/strict`,
same style as `backend/shared/pray/parsePrayRequest.test.js`. Write it FIRST
and watch it fail (TDD). Cases:
- `"2026-10-04"` → true; `"2024-02-29"` → true (leap day)
- `"2026-02-29"` → false; `"2026-13-01"` → false; `"2026-10-32"` → false
- `"2026-1-4"` → false; `""` → false; `"2026-10-04T00:00:00Z"` → false
- `null`, `undefined`, `20261004` (number) → false

Run: `node --test backend/shared/isIsoDate.test.js`

**1c. `backend/functions/prayers/update/index.js`:**
- `require` the validator next to the db import:
  `const { isIsoDate } = require("./shared/isIsoDate");`
  (the function's Makefile copies `backend/shared` to `./shared` at build).
- Add `repeatOn: "repeat_on"` to `UPDATABLE_FIELDS` (before `answered`).
- Add `repeatOn: "::date"` to `FIELD_CASTS`.
- Add a validation block alongside the others (after the `recurringDays`
  check):

```js
  if ("repeatOn" in body && body.repeatOn !== null && !isIsoDate(body.repeatOn)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "repeatOn must be null or a date in YYYY-MM-DD format",
      }),
    };
  }
```

Nothing else in the handler changes — the generic SET-clause builder and the
existing `RETURNING ... pr.repeat_on::text AS "repeatOn"` already cover it.
Sanity-check the handler loads: `node -e "require('./backend/functions/prayers/update/index.js')"`
will fail on `./shared/db` (it only exists after `sam build`) — that is
expected; instead verify syntax with `node --check backend/functions/prayers/update/index.js`.

**1d. `docs/system-design.md`:**
- In the API table row for `PATCH /prayers/:id`, add `repeatOn` to the body
  field list (`{ requestText, prayeeId, categoryId, frequencyType, recurringDays, repeatOn, answered }`)
  and append to its notes: `` `repeatOn` (`YYYY-MM-DD` or null) puts a request back in the deck from that date — used to re-add a prayed one-time request ``.
- In section 7, the `"One time" vs recurring semantics` bullet: append
  `A prayed one-time request can be put back in the deck from the Edit
  screen (tap "Once"), which sets repeatOn to the user's local today; if it
  was already prayed today it reappears tomorrow.`

Commit: `feat(prayers): accept repeatOn in PATCH /prayers/:id`

---

### Task 2: Frontend — data layer, draft state, save

**Files:**
- Create: `frontend/src/utils/localToday.ts`
- Modify: `frontend/src/utils/index.ts`
- Modify: `frontend/src/apis/prayerRequest.api.ts`
- Modify: `frontend/src/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation.ts`
- Modify: `frontend/src/features/editPrayer/stores/useEditPrayerDraftStore.ts`
- Modify: `frontend/src/features/editPrayer/components/EditSave/EditSave.tsx`

**2a. `frontend/src/utils/localToday.ts`:**

```ts
const pad = (n: number) => String(n).padStart(2, '0');

// The device's local calendar date as "YYYY-MM-DD".
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
```

Export it from `frontend/src/utils/index.ts` (`export { localToday } from './localToday';`).

**2b. `prayerRequest.api.ts`:** add `repeatOn?: string | null;` to
`UpdatePrayerRequestBody`.

**2c. `useUpdatePrayerRequestMutation.ts`:** add `| 'repeatOn'` to the `Pick`
list so the optimistic update spreads it into the cached `PrayerRequest`.

**2d. `useEditPrayerDraftStore.ts`:**
- Add `prayAgain: boolean` to `EditPrayerSnapshot`; `EMPTY.prayAgain = false`.
- Add to `EditPrayerDraft` (NOT the snapshot — read-only facts from the
  server): `isDormant: boolean` and `lastPrayedAt: string | null`. Initial
  values `false` / `null`; `clear()` resets them to those.
- `reset(prayer)`: snapshot gets `prayAgain: false`; also set
  `isDormant = prayer.status === 'active' && prayer.frequencyType === 'one_time' && prayer.lastPrayedAt !== null && prayer.repeatOn === null`
  and `lastPrayedAt = prayer.lastPrayedAt`.
- New action `togglePrayAgain: () => void` → `set((s) => ({ prayAgain: !s.prayAgain }))`.
- `setFrequency` now also sets `prayAgain: false`.
- `selectIsPrayerDraftDirty` adds `s.prayAgain !== s.snapshot.prayAgain ||`.

**2e. `EditSave.tsx`:** in the `updatePrayer({...})` call only (not create),
add `...(draft.prayAgain && { repeatOn: localToday() })`, importing
`localToday` from `@/utils`.

Verify: `cd frontend && npx tsc --noEmit && npm run lint` both clean.
(The frontend has no unit-test runner; type-check + lint is the gate.)

Commit: `feat(editPrayer): track pray-again draft state and send repeatOn on save`

---

### Task 3: Frontend — the "Once" cell UI

**Files:**
- Modify: `frontend/src/features/editPrayer/components/EditFrequncy/EditFrequncy.tsx`
- Modify: `frontend/src/features/editPrayer/components/EditFrequncy/EditFrequncy.styles.ts`

Depends on Task 2's store fields: `isDormant`, `lastPrayedAt`, `prayAgain`,
`togglePrayAgain`.

**Behaviour of the Once cell** (weekday cells unchanged):

| State | Condition | Fill / text | Sublabel under "Once" | Tap does |
|---|---|---|---|---|
| Normal one_time | `frequencyType === 'one_time' && !isDormant` | accent / primary (as today) | none | nothing (as today) |
| Dormant | `frequencyType === 'one_time' && isDormant && !prayAgain` | `COLORS.primary` bg, `COLORS.secondaryText` text, `borderWidth: 1.5` `borderColor: COLORS.accent` inset (not accent fill) | `Prayed Oct 2` | `togglePrayAgain()` |
| Re-armed | `frequencyType === 'one_time' && isDormant && prayAgain` | accent / primary | `Back in deck today` or `Back in deck tomorrow` | `togglePrayAgain()` (undo) |
| Recurring selected | `frequencyType === 'recurring'` | Once unselected (as today) | none | `setFrequency('one_time', [])` (as today) |

- Sublabel date: `new Date(lastPrayedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })` → `Prayed Oct 2`.
- today vs tomorrow: `daysSince(lastPrayedAt) === 0` → `tomorrow`, else
  `today` (`daysSince` from `@/utils`).
- In `toggle`, replace the `if (frequencyType === 'one_time') return;` early
  return with: if `isDormant` call `togglePrayAgain()`, then return.
- `accessibilityState.selected` for Once is `true` in Normal and Re-armed,
  `false` in Dormant. Give the dormant Once cell an
  `accessibilityHint` of `"Adds this request back to your prayer deck"`.
- New styles: `optionDormant` (border inset as above), `optionSubtext`
  (`fontFamily(500)`, `fontSize: 11`, `marginTop: 2`, `color: COLORS.secondaryText`),
  `optionSubtextSelected` (`color: COLORS.primary`). The cell keeps its
  existing `paddingVertical: 25`; the sublabel must not change the grid's
  row height noticeably — reduce Once's padding when a sublabel shows if
  needed so both rows stay equal height.
- Keep the component readable: compute a single `onceState`
  (`'normal' | 'dormant' | 'rearmed' | 'unselected'`) once, then derive
  styles/labels from it, rather than scattering conditions through JSX.

Verify: `cd frontend && npx tsc --noEmit && npm run lint` both clean.

Commit: `feat(editPrayer): show prayed state on Once and tap to re-add to deck`
