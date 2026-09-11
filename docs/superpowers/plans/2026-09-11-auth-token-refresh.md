# Auth Token Refresh Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop signing users out when their 1-hour ID token expires mid-session,
by refreshing the token and retrying the request instead of discarding a
refresh token that still has weeks of life left.

**Architecture:** Today the only expiry check in the app runs at launch, inside
`useAuthStore.bootstrap()`. Once the app is running the ID token ages silently,
and the first request after the 1-hour mark gets a 401 — which `apiClient`
turns into an immediate `signOut()`, throwing away a 30-day refresh token.

This plan pulls the "read credentials from SecureStore → refresh → persist" flow
out of `bootstrap()` into a single shared store action, `refreshFromStorage()`,
then adds a module-level single-flight wrapper so that N concurrent TanStack
queries triggering 401s produce exactly one Cognito call. `apiFetch` gains a
pre-flight expiry check (skip the doomed request entirely) and a reactive 401
retry (handle the cases the pre-flight check can't predict — clock skew,
server-side revocation). 403 stops being treated as a sign-out, because
authorization failures are not fixed by a fresh token.

**Tech Stack:** React Native / Expo, TypeScript, Zustand, `expo-secure-store`,
`amazon-cognito-identity-js`, TanStack Query v5.

**Spec:** No spec document — this is a bug fix against existing behavior
established in `frontend/src/stores/useAuthStore.ts` and
`frontend/src/apis/apiClient.ts`. Token lifetimes are defined in
`backend/infra/template.yaml:79-85` (`IdTokenValidity: 1` hour,
`RefreshTokenValidity: 30` days). No change to `docs/system-design.md` is
required; this alters no data model, endpoint, or screen.

## Global Constraints

- **No test framework is used.** This repo has no jest, no vitest, no test
  script — `frontend/package.json` scripts are `start`, `reset-project`,
  `android`, `ios`, `lint` only. Every task ends with **manual verification
  steps** in the running Expo app with expected observable output. Do not
  install a test runner. This follows the precedent set by
  `docs/superpowers/plans/2026-09-10-add-prayee-and-category.md`.
- **`@/*` path alias** points at `frontend/src/*`. All new imports use
  `@/stores/...`, `@/apis/...` — never relative paths across directories.
- **The ID token is the credential.** `apiFetch` sends `Authorization: <idToken>`
  with no `Bearer` prefix (`apiClient.ts:52`). Do not change this — API
  Gateway's `CognitoAuth` authorizer is configured for it. The access token is
  fetched by `auth.api.ts` and deliberately discarded.
- **Never log token values.** Console statements may reference token *presence*
  or expiry timestamps, never the token string itself.
- **Existing public API of `apiClient` is law.** `apiFetch<T>(path, init?)` and
  the `ApiError` class are consumed by `prayee.api.ts`, `category.api.ts`,
  `prayerRequest.api.ts`, `AddPrayeeSheet.tsx`, and `AddCategorySheet.tsx`.
  The two-argument call signature and `ApiError`'s `status`/`message` fields
  must not change.
- **Run `npm run lint` in `frontend/` before every commit.** It must pass clean.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `frontend/src/stores/useAuthStore.ts` | Modify | Owns credentials. Gains `refreshFromStorage()` (the one place that reads SecureStore, calls Cognito, and persists) and exports `isExpired` + `getIdToken`. `bootstrap()` becomes a thin caller. |
| `frontend/src/apis/refreshToken.ts` | Create | Single-flight wrapper around the store's `refreshFromStorage()`. Lives in `apis/` not `stores/` because it exists to serve the HTTP layer's concurrency needs. |
| `frontend/src/apis/apiClient.ts` | Modify | Pre-flight expiry check, 401 retry-once, 403 no longer signs out. |
| `frontend/src/app/_layout.tsx` | Modify | `AppState` listener refreshing on foreground. |

Why `refreshToken.ts` is its own file rather than living in the store: the
single-flight promise is a concern of the *caller* (many parallel HTTP requests),
not of the credential store. Keeping it out of `useAuthStore` means the store
stays a plain state container with no module-level mutable state hiding in it.

---

## Task 1: Extract `refreshFromStorage()` onto the auth store

Establishes the single refresh path. `bootstrap()` is rewritten to use it, so
this task is verifiable on its own — launch behavior must be unchanged.

**Files:**
- Modify: `frontend/src/stores/useAuthStore.ts:11-18` (the `AuthStore` type)
- Modify: `frontend/src/stores/useAuthStore.ts:45-54` (export `isExpired`)
- Modify: `frontend/src/stores/useAuthStore.ts:74-107` (`bootstrap` rewrite)

**Interfaces:**
- Consumes: nothing — first task.
- Produces:
  - `useAuthStore` gains `refreshFromStorage: () => Promise<string | null>` —
    resolves to the **new ID token string** on success, or `null` if refresh was
    impossible or failed. Never throws. Signs the user out on failure.
  - `export function isExpired(idToken: string): boolean` — promoted from
    module-private to exported.
  - `export const getIdToken: () => string | null` — already exists at line 109,
    unchanged.

- [ ] **Step 1: Add `refreshFromStorage` to the `AuthStore` type**

In `frontend/src/stores/useAuthStore.ts`, replace the type block at lines 11-18:

```ts
type AuthStore = {
  idToken: string | null;
  isBootstrapping: boolean;

  signIn: (email: string, tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  bootstrap: () => Promise<void>;
  refreshFromStorage: () => Promise<string | null>;
};
```

- [ ] **Step 2: Export `isExpired`**

Change line 45 from `function isExpired(` to:

```ts
export function isExpired(idToken: string): boolean {
```

The body is unchanged. Note the existing 60-second skew buffer on line 50
(`Date.now() >= exp * 1000 - 60_000`) — a token with 30 seconds left is treated
as already expired, so we never send a request that dies in flight. Keep it.

- [ ] **Step 3: Implement `refreshFromStorage`**

Add this as a new action on the store, immediately after `signOut` (after line
72, before `bootstrap`):

```ts
  refreshFromStorage: async () => {
    const [email, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(EMAIL_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!email || !refreshToken) {
      await get().signOut();
      return null;
    }

    try {
      const tokens = await refreshSession(email, refreshToken);
      await get().signIn(email, tokens);
      return tokens.idToken;
    } catch {
      await get().signOut();
      return null;
    }
  },
```

Three things worth understanding here:

- **It returns the token rather than relying on the caller re-reading the
  store.** Zustand's `set` is synchronous, so `getIdToken()` would work — but
  returning the value makes the contract explicit and means the caller can't
  accidentally read a token some *other* refresh wrote.
- **It never throws.** Callers branch on `null`. An HTTP interceptor that has
  to `try/catch` its own recovery path is harder to read.
- **It signs out on every failure path.** If the refresh token is gone or
  Cognito rejects it, the session is genuinely unrecoverable — that is the one
  case where logging the user out is correct.

`refreshSession` is already imported at line 4. `EMAIL_KEY` and
`REFRESH_TOKEN_KEY` are already defined at lines 8-9.

- [ ] **Step 4: Rewrite `bootstrap` to use it**

Replace the entire `bootstrap` action (lines 74-107 in the original file) with:

```ts
  bootstrap: async () => {
    const idToken = await SecureStore.getItemAsync(ID_TOKEN_KEY);

    if (idToken && !isExpired(idToken)) {
      set({ idToken, isBootstrapping: false });
      return;
    }

    if (!idToken) {
      set({ idToken: null, isBootstrapping: false });
      return;
    }

    await get().refreshFromStorage();
    set({ isBootstrapping: false });
  },
```

Behavior is identical to the original: valid token → use it; no token → signed
out; expired token → try refresh, sign out if it fails. The
read-email-and-refresh-token-then-decide block that was inlined at lines 87-105
now lives in exactly one place.

- [ ] **Step 5: Lint**

```bash
cd frontend && npm run lint
```

Expected: clean, no errors.

- [ ] **Step 6: Manually verify launch is unchanged**

Start the app: `cd frontend && npm run start`, then open on device/simulator.

Verify all three launch paths still behave as before:

1. **Signed out** (fresh install, or after tapping sign out): app lands on the
   login screen, no crash.
2. **Signed in with a valid token** (sign in, then fully quit and relaunch the
   app within the hour): lands straight on `/home` with prayer data loaded, no
   login screen flash.
3. **Signed in with an expired token:** the honest way to force this is to wait
   out the hour. To test it now instead, temporarily change the skew buffer on
   line 50 from `60_000` to a number larger than the full token lifetime — e.g.
   `3_700_000` (just over an hour) — which makes `isExpired` return `true` for
   every token. Relaunch: you should land on `/home` normally (a refresh
   happened silently), **not** on the login screen.
   **Revert line 50 back to `60_000` before committing.**

- [ ] **Step 7: Commit**

```bash
git add frontend/src/stores/useAuthStore.ts
git commit -m "refactor: extract refreshFromStorage from bootstrap"
```

---

## Task 2: Single-flight refresh wrapper

The concurrency guard. Without this, N parallel TanStack queries hitting 401 at
the same moment fire N refreshes.

**Files:**
- Create: `frontend/src/apis/refreshToken.ts`

**Interfaces:**
- Consumes: `useAuthStore` and its `refreshFromStorage` from Task 1.
- Produces: `export function refreshTokenOnce(): Promise<string | null>` —
  resolves to the new ID token, or `null` on failure. Concurrent callers share
  one in-flight refresh.

- [ ] **Step 1: Create the file**

Create `frontend/src/apis/refreshToken.ts`:

```ts
import { useAuthStore } from '@/stores/useAuthStore';

// Concurrent 401s (several TanStack queries in flight when the ID token ages
// out) must not each trigger their own Cognito call. Cognito can rotate the
// refresh token on use, so a second refresh could be sent a token the first one
// already invalidated - a spurious sign-out. Everyone shares one promise.
let inFlight: Promise<string | null> | null = null;

export function refreshTokenOnce(): Promise<string | null> {
  inFlight ??= useAuthStore
    .getState()
    .refreshFromStorage()
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
```

Why each piece matters:

- **`??=`** assigns only when `inFlight` is `null`. The first caller starts the
  refresh; every caller after it gets the same promise back and awaits the same
  result.
- **`.finally()` clearing the slot** is what lets the *next* expiry, an hour
  later, refresh again. It runs on rejection as well as success — so a failed
  refresh doesn't permanently wedge the slot. (`refreshFromStorage` never
  rejects, but `finally` is the correct defensive shape regardless.)
- **`useAuthStore.getState()` rather than a hook.** This is not a React
  component; there is no render to subscribe to. `getState()` reads the current
  store imperatively.

- [ ] **Step 2: Lint**

```bash
cd frontend && npm run lint
```

Expected: clean. (The file is not imported by anything yet — that is expected
at this point and is not a lint error.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/apis/refreshToken.ts
git commit -m "feat: add single-flight token refresh wrapper"
```

---

## Task 3: Pre-flight expiry check and 401 retry in `apiFetch`

The actual bug fix.

**Files:**
- Modify: `frontend/src/apis/apiClient.ts:1` (imports)
- Modify: `frontend/src/apis/apiClient.ts:18-26` (remove the 401/403 block from
  `parseResponse`)
- Modify: `frontend/src/apis/apiClient.ts:45-57` (`apiFetch` rewrite)

**Interfaces:**
- Consumes: `refreshTokenOnce()` from Task 2; `isExpired` and `getIdToken` from
  Task 1.
- Produces: `apiFetch<T>(path: string, init?: RequestInit): Promise<T>` —
  unchanged public signature. The third parameter added below is internal;
  no caller passes it.

- [ ] **Step 1: Update the imports**

Replace line 1 of `frontend/src/apis/apiClient.ts`:

```ts
import { getIdToken, isExpired } from '@/stores/useAuthStore';
import { refreshTokenOnce } from '@/apis/refreshToken';
```

Note `useAuthStore` is dropped from this import. The old line 1 imported it only
for the `signOut()` call inside `parseResponse`, which Step 2 deletes — the
retry path signs out via `refreshFromStorage` instead.

- [ ] **Step 2: Remove the 401/403 sign-out from `parseResponse`**

Delete lines 19-25 entirely — this block:

```ts
  if (response.status === 401 || response.status === 403) {
    await useAuthStore.getState().signOut();
    throw new ApiError(
      response.status,
      'Your session expired. Please sign in again.',
    );
  }
```

`parseResponse` goes back to being a plain body parser, starting directly with
`const text = await response.text();`. Its signature does not change.

Two separate fixes in one deletion:

- **401 handling moves to `apiFetch`**, which is the only place with the `path`
  and `init` needed to replay the request. It also has to happen *before* the
  body is read — a `Response` body streams once, so once `parseResponse` calls
  `.text()` the original response can't be reused.
- **403 is no longer a sign-out at all.** API Gateway returns 401 for a
  missing/expired/invalid token and 403 for authorization failures — WAF rules,
  resource policies, wrong scopes. A fresh token fixes none of those. 403 now
  falls through to the normal error path at lines 29-40, which surfaces the
  server's message.

- [ ] **Step 3: Rewrite `apiFetch`**

Replace the whole `apiFetch` function (lines 45-57) with:

```ts
async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  isRetry = false,
): Promise<T> {
  let token = getIdToken();

  // Pre-flight: a token we already know is expired will only ever come back
  // 401, so spend the refresh now instead of paying a wasted round-trip first.
  if (token && isExpired(token) && !isRetry) {
    token = await refreshTokenOnce();
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
      ...init?.headers,
    },
  });

  // Reactive: the pre-flight check can't catch everything - clock skew, a token
  // revoked server-side, a pool config change. Refresh once and replay.
  if (response.status === 401 && !isRetry) {
    const fresh = await refreshTokenOnce();
    if (fresh) return apiFetch<T>(path, init, true);

    throw new ApiError(401, 'Your session expired. Please sign in again.');
  }

  return parseResponse<T>(response);
}
```

Four details that matter:

- **`isRetry` guards against an infinite loop.** If the replayed request also
  401s, we do not refresh again — we fall through to `parseResponse`, which
  raises a normal `ApiError`. One retry, then stop.
- **The 401 check comes before `parseResponse`** for the body-streams-once
  reason above.
- **No `signOut()` call in the 401 branch.** `refreshFromStorage` already signed
  out on the failure path (Task 1, Step 3), which is why `useAuthStore` is no
  longer imported in this file at all.
- **`init.body` is always a JSON string** in this codebase, so replaying the
  request is safe. A streamed body could not be re-sent.

- [ ] **Step 4: Lint**

```bash
cd frontend && npm run lint
```

Expected: clean.

- [ ] **Step 5: Manually verify the bug is fixed**

This is the critical verification of the whole plan. Start the app signed in,
sitting on `/home` with data loaded.

**Test A — expired token recovers silently.** Force expiry without waiting an
hour: in `useAuthStore.ts` line 50, temporarily change `60_000` to `3_700_000`
so `isExpired` returns `true` for any token. Reload the app, sign in if needed,
then pull-to-refresh or navigate to trigger a query.

Expected: data loads normally. You are **not** kicked to the login screen. In
the Expo/network logs you should see at most one Cognito refresh call, not one
per query. **Revert line 50 to `60_000` afterward.**

**Test B — single-flight holds under concurrency.** With the same forced-expiry
change in place, cold-launch to a screen that fires several queries at once
(`/home` fires prayers, prayees, and categories). Watch the network log.

Expected: exactly one request to `cognito-idp.*.amazonaws.com`, followed by all
the API requests succeeding. Several Cognito calls means the single-flight guard
is not working. **Revert line 50 afterward.**

**Test C — a genuinely dead session still signs out.** With line 50 back at
`60_000`, corrupt the stored refresh token so Cognito rejects it: temporarily
add `await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, 'garbage');` at the top
of `refreshFromStorage`, then force expiry again via line 50 and trigger a query.

Expected: you land on the login screen. That is correct — the session really is
unrecoverable. **Remove the garbage line and revert line 50 afterward.**

**Test D — normal signed-in use is unaffected.** With all temporary edits
reverted, use the app normally: create a prayer, add a prayee, add a category,
delete a prayer.

Expected: everything behaves exactly as before this plan. Confirm the 409
duplicate-name error still shows inline in `AddPrayeeSheet` / `AddCategorySheet`
— those read `ApiError.status` and `.message`, which this task must not have
broken.

- [ ] **Step 6: Confirm all temporary test edits are reverted**

```bash
cd frontend && git diff src/stores/useAuthStore.ts
```

Expected: the diff shows **no** change to the `60_000` skew buffer on line 50,
and no `garbage` string anywhere. If either appears, revert it before
committing.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/apis/apiClient.ts
git commit -m "fix: refresh token and retry on 401 instead of signing out"
```

---

## Task 4: Refresh on app foreground

Latency polish. With Task 3 in place the app already recovers correctly; this
moves the recovery to the moment the user reopens the app, so their first tap
isn't waiting on a Cognito round-trip.

**Files:**
- Modify: `frontend/src/app/_layout.tsx:1-20` (imports)
- Modify: `frontend/src/app/_layout.tsx` (the `useEffect` calling `bootstrap`)

**Interfaces:**
- Consumes: `refreshTokenOnce()` from Task 2, `isExpired`/`getIdToken` from
  Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the imports**

In `frontend/src/app/_layout.tsx`, add to the existing React import and add
`AppState`:

```ts
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { getIdToken, isExpired, useAuthStore } from '@/stores/useAuthStore';
import { refreshTokenOnce } from '@/apis/refreshToken';
```

Replace the existing `import { useAuthStore } from '@/stores/useAuthStore';`
line rather than adding a second import from the same module.

- [ ] **Step 2: Add the foreground listener**

Immediately after the existing `useEffect(() => { bootstrap(); }, [bootstrap]);`
block, add a second effect:

```ts
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;

      const token = getIdToken();
      if (token && isExpired(token)) refreshTokenOnce();
    });

    return () => subscription.remove();
  }, []);
```

Notes:

- **`state !== 'active'` early-returns** on `background` and `inactive`. On iOS
  `inactive` fires for transient things like the app switcher or a notification
  banner, so filtering to `active` keeps this from running constantly.
- **Guarded by `isExpired`** so returning to the app after 30 seconds does
  nothing. Only a genuinely stale token triggers a call.
- **Not awaited.** This is a warm-up; nothing blocks on it. If it fails,
  `refreshFromStorage` signs the user out, and if it's still in flight when the
  user taps, `apiFetch`'s call to `refreshTokenOnce()` returns the same
  in-flight promise rather than starting a second one — which is exactly what
  the single-flight wrapper is for.
- **Empty dependency array** — the listener is registered once for the app's
  lifetime, and `subscription.remove()` in the cleanup prevents a duplicate
  listener on fast-refresh during development.

- [ ] **Step 3: Lint**

```bash
cd frontend && npm run lint
```

Expected: clean.

- [ ] **Step 4: Manually verify**

**Test A — foreground with a fresh token does nothing.** Signed in, background
the app (swipe to home screen), wait ~10 seconds, reopen.

Expected: no Cognito call in the network log. App resumes instantly.

**Test B — foreground with a stale token refreshes.** Force expiry via the
line-50 trick from Task 3 (`60_000` → `3_700_000`), reload, background the app,
reopen.

Expected: a single Cognito refresh fires on resume, *before* you tap anything.
Then tapping around loads data with no additional refresh. **Revert line 50.**

**Test C — no duplicate listeners.** With Expo running, save an unrelated file a
few times to trigger fast refresh, then background/foreground the app.

Expected: still exactly one Cognito call, not one per fast-refresh. This
confirms the cleanup function works.

- [ ] **Step 5: Confirm temporary edits reverted**

```bash
cd frontend && git diff src/stores/useAuthStore.ts
```

Expected: empty (the file was committed in Task 1 and should be untouched
since).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/_layout.tsx
git commit -m "feat: refresh stale token when app returns to foreground"
```

---

## Verification Summary

After all four tasks, the following must all hold:

1. Launch signed out → login screen.
2. Launch signed in, token valid → straight to `/home`.
3. Launch signed in, token expired → straight to `/home`, one refresh.
4. **Token expires mid-session → requests recover silently, no logout.** (The bug.)
5. Several concurrent queries on an expired token → exactly one Cognito call.
6. Refresh token genuinely dead → login screen, as before.
7. App foregrounded with a stale token → refreshed before the user taps.
8. 403 from the API → error surfaced inline, user stays signed in.
9. Normal CRUD (create/delete prayer, add prayee, add category) unchanged,
   including the inline 409 duplicate-name message.

## Out of Scope

- **Backend token lifetimes.** `IdTokenValidity: 1` hour and
  `RefreshTokenValidity: 30` days (`backend/infra/template.yaml:79-85`) stay as
  they are. A 1-hour ID token is a reasonable default; the bug was the client's
  handling of it, not the value.
- **The unused access token.** `auth.api.ts:73` fetches an access token that is
  never stored or sent. Switching the `Authorization` header from the ID token
  to the access token is the more textbook split (identity vs. authorization),
  but it requires reconfiguring the API Gateway authorizer and every Lambda's
  claim lookup. Separate change, separate plan.
- **Cognito refresh token rotation.** Not currently configured. The
  single-flight wrapper makes the client safe if it is ever enabled, but
  enabling it is not part of this work.
- **The 3-minute OTP window.** The sign-in code TTL
  (`verify-auth-challenge/index.js`) is anchored to the first email, so burning
  time on typos can leave the remaining attempts useless. Real, but a separate
  sign-in UX problem — unrelated to session tokens.
