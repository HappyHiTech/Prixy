# Active Deck Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Home's Active Deck tab and Pray Mode show the same list, and widen "never prayed" in the deck rule to every frequency.

**Architecture:** One backend SQL branch changes in `GET /deck`. Home's Active Deck tab keeps its existing full-row list but filters it to the ids in the deck query, so the deck rule stays in one place on the server.

**Tech Stack:** Node.js Lambda + Postgres; Expo / React Native, TanStack Query v5.

**Spec:** `docs/pray-mode-spec.md` (D1, D2, D3, D12 and section 7.6).

## Global Constraints

- Active Deck = `status = 'active'` AND not prayed today AND (`last_prayed_at IS NULL` OR recurring with today's `Dy` in `recurring_days` OR `repeat_on <= today`).
- No code comments unless truly needed.
- No frontend test runner; verify with `cd frontend && npx tsc --noEmit && npm run lint`.
- Do not run `aws` or `sam` commands; deploys and database checks are done by the user.
- Commit messages are conventional (`fix(deck): …`) with no attribution lines. Stage only the files you change.

---

### Task 1: "Never prayed" covers every frequency

**Files:**
- Modify: `backend/functions/deck/get/index.js` (the inclusion `OR` group in `DECK_SQL`)

**Interfaces:**
- Consumes: nothing new
- Produces: `GET /deck` now also returns a recurring request that has never been prayed, on any day

- [ ] **Step 1: Change the first branch**

In `DECK_SQL`, replace

```js
        (pr.frequency_type = 'one_time' AND pr.last_prayed_at IS NULL)
        OR (pr.frequency_type = 'recurring'
```

with

```js
        pr.last_prayed_at IS NULL
        OR (pr.frequency_type = 'recurring'
```

Everything else in the query stays the same. The outer `AND (pr.last_prayed_at IS NULL OR ... < today.d)` guard still excludes anything prayed today.

- [ ] **Step 2: Syntax check**

Run: `node --check backend/functions/deck/get/index.js`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add backend/functions/deck/get/index.js
git commit -m "fix(deck): include never-prayed requests of any frequency"
```

---

### Task 2: Home's Active Deck tab shows the deck

**Files:**
- Modify: `frontend/src/features/home/components/RequestView/RequestView.tsx`

**Interfaces:**
- Consumes: `useDeckQuery()` from `@/hooks/TanStack/deck/useDeckQuery` returning `Deck` (`{ prayedToday, cards: DeckPrayer[] }`, each card has `id`)
- Produces: the Active Deck tab lists only requests whose id is in the deck

- [ ] **Step 1: Import the deck query**

Add under the other hook imports:

```tsx
import { useDeckQuery } from '@/hooks/TanStack/deck/useDeckQuery';
```

- [ ] **Step 2: Read the deck and derive the visible list**

After the `useCategoriesQuery()` line, add:

```tsx
  const deckQuery = useDeckQuery();
  const isActiveTab = activeSegment === 'active';

  const deckIds = useMemo(
    () => new Set(deckQuery.data?.cards.map((card) => card.id)),
    [deckQuery.data],
  );

  const visibleReqs = useMemo(
    () =>
      isActiveTab
        ? (prayReqs ?? []).filter((req) => deckIds.has(req.id))
        : (prayReqs ?? []),
    [isActiveTab, prayReqs, deckIds],
  );
```

- [ ] **Step 3: Wait for the deck on the Active tab**

Replace

```tsx
  if (isPending) {
```

with

```tsx
  if (isPending || (isActiveTab && deckQuery.isPending)) {
```

and replace

```tsx
  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{error.message}</Text>
      </View>
    );
  }
```

with

```tsx
  const loadError = isError ? error : isActiveTab ? deckQuery.error : null;

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{loadError.message}</Text>
      </View>
    );
  }
```

- [ ] **Step 4: Render the filtered list and update the empty copy**

Replace `if (prayReqs.length === 0) {` with `if (visibleReqs.length === 0) {`, replace the string `'No prayers in your active deck yet.'` with `'Nothing in your active deck today.'`, and replace `{prayReqs.map((item) => (` with `{visibleReqs.map((item) => (`.

- [ ] **Step 5: Typecheck and lint**

Run: `cd frontend && npx tsc --noEmit && npm run lint`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/home/components/RequestView/RequestView.tsx
git commit -m "feat(home): show only the Active Deck on the Active Deck tab"
```

---

### Verification after deploy (done by the user)

1. Rebuild and deploy the backend, then open Home: the Active Deck tab lists exactly the requests Pray Mode shows, and "Deck: N" equals the number of rows.
2. Add a recurring request for a weekday that is not today, with a prayee and a category: it is in the Active Deck on both Home and Pray.
3. Swipe a card in Pray, then go to Home: it has left the Active Deck tab and "Deck: N" dropped by one.
4. The Inbox tab is unchanged.
