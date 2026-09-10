# Add Prayee & Add Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Add a name" and "Add a Category" pills in the sidebars
actually create prayees and categories — a bottom-sheet form on the frontend,
two new `POST` Lambdas on the backend, with a clean inline error when the name
already exists.

**Architecture:** Two new Lambdas (`POST /prayees`, `POST /categories`) follow
the exact handler shape already established by `functions/prayers/create` —
resolve `cognito_sub` → `users.id`, insert, return the camelCased row. The
existing `UNIQUE (user_id, name)` constraint is upgraded to a case-insensitive
unique index so "family" and "Family" collide; the Lambdas catch Postgres error
code `23505` and return `409` with a message the UI can show verbatim. On the
frontend, the shared `Sidebar` component gains an `onAdd` callback, and each
feature owns its own bottom sheet (`AddPrayeeSheet`, `AddCategorySheet`)
rendered above the sidebar. `apiClient` is extended to surface server error
messages and status codes (it currently discards both), which is what makes the
409 legible to the user.

**Tech Stack:** AWS Lambda (Node.js, `pg`), API Gateway (SAM), PostgreSQL,
React Native / Expo, TanStack Query v5, `lucide-react-native`, TypeScript.

**Spec:** `docs/system-design.md` — §3 data model (`Prayee`, `Category`), §4 API
contract (`POST /prayees`, `POST /categories`), §5 screen mapping ("Prayee chip
→ opens Praying For picker (`GET`/`POST /prayees`)"). This plan implements the
API table as written; no divergence, no spec update required.

**Design source:** Mobbin research, 2026-09-10. Prayee sheet follows the
minimal single-field modal pattern; category sheet follows the
[stoic.](https://mobbin.com/screens/39d7f8c4-68a0-458e-a15c-fd6e4951385a) /
[Monzo](https://mobbin.com/screens/f49a18a6-8f9e-47d2-af81-c8c7129e4e75)
convention — live icon preview at top, name field, icon grid below, Save
disabled until the name is non-empty.

## Global Constraints

- **No test framework is used.** This repo has no jest, no test script, front
  or back. Every task ends with **manual verification steps** — a `curl` with
  expected output, or on-device steps in Expo with expected UI. Do not install
  a test runner.
- **Existing handler shape is law.** Every new Lambda mirrors
  `backend/functions/prayers/create/index.js`: `require("./shared/db")`, the
  `sub` guard returning 401, `withClient`, a `users` lookup returning 404 if
  absent, `Content-Type: application/json` on every response, and a `catch`
  returning 500 with `err.message`.
- **SQL returns camelCase.** Every column is aliased in the `RETURNING` clause
  (`user_id AS "userId"`, `is_default AS "isDefault"`, `created_at AS
  "createdAt"`). The frontend never sees snake_case.
- **Migrations are append-only and idempotent.** New file
  `004_case_insensitive_names.sql`. `ops/migrate` replays *every* `.sql` file in
  the directory on every run, so all statements must be safe to re-run
  (`IF EXISTS` / `IF NOT EXISTS`).
- **Colors come from `@/constants` `COLORS` only** — no new hex literals in
  component styles. Available: `primary` `#FFFFFF`, `secondary` `#000000`,
  `accent` `#3D5A6C`, `danger` `#B24C41`, `dangerText` `#D9382B`, `primaryBg`
  `#F5F5F5`, `primaryText` `#4A4A4A`, `secondaryText` `#999999`, `tint`
  `rgba(0, 0, 0, 0.5)`, `borderOne` `#E9E9E9`.
- **Frontend imports use the `@/*` alias** (→ `frontend/src/*`), never relative
  paths across feature boundaries. Within a component folder, relative imports
  for `./X.styles` are correct and match existing code.
- **Component file convention:** `features/<feature>/components/<Name>/<Name>.tsx`
  plus `<Name>.styles.ts` exporting a named `styles` from `StyleSheet.create`.
  Default-export the component.
- **Fonts** come from the `fontFamily(weight)` helper in `@/constants`, e.g.
  `...fontFamily(800)`. Never set `fontFamily` as a raw string.
- **Post-create behavior (user decision):** the new item is added to the list
  and **the sidebar stays open**. Creating does *not* auto-assign the item to
  the prayer and does *not* close the sidebar. The user taps the new row to
  assign it, exactly as with any existing row.
- **Scope is create-only.** No PATCH, no DELETE for prayees or categories.
  `docs/mockups/Edit Name.png` and `Edit Category Sidebar.png` are a later plan.

---

## File Structure

**Backend — created:**
- `backend/functions/prayees/create/{index.js,package.json,Makefile}` — the
  `POST /prayees` handler.
- `backend/functions/categories/create/{index.js,package.json,Makefile}` — the
  `POST /categories` handler.
- `backend/functions/ops/migrate/sql/004_case_insensitive_names.sql` — swaps
  the case-sensitive `UNIQUE (user_id, name)` constraints for case-insensitive
  unique indexes.

**Backend — modified:**
- `backend/infra/template.yaml` — two new `AWS::Serverless::Function` resources
  wired to the API Gateway with `CognitoAuth`.

**Frontend — created:**
- `frontend/src/constants/categoryIcons.ts` — the curated 10-icon list, the
  single source of truth for which `Category.icon` values are valid.
- `frontend/src/components/BottomSheet/{BottomSheet.tsx,BottomSheet.styles.ts}` —
  generic modal shell (backdrop, sheet, Cancel / title / Save header). Shared
  because both sheets need identical chrome.
- `frontend/src/features/prayee/components/AddPrayeeSheet/{AddPrayeeSheet.tsx,AddPrayeeSheet.styles.ts}`
- `frontend/src/features/category/components/AddCategorySheet/{AddCategorySheet.tsx,AddCategorySheet.styles.ts}`
- `frontend/src/features/category/components/IconPicker/{IconPicker.tsx,IconPicker.styles.ts}`
- `frontend/src/hooks/TanStack/useCreatePrayeeMutation.ts`
- `frontend/src/hooks/TanStack/useCreateCategoryMutation.ts`

**Frontend — modified:**
- `frontend/src/apis/apiClient.ts` — throw a typed `ApiError` carrying the
  server's status and message instead of a generic `Error`.
- `frontend/src/apis/prayee.api.ts` — add `createPrayee`.
- `frontend/src/apis/category.api.ts` — add `createCategory`.
- `frontend/src/components/Sidebar/Sidebar.tsx` — the add pill becomes a real
  `Pressable` calling a new required `onAdd` prop.
- `frontend/src/components/CategoryAvatar/CategoryAvatar.tsx` — its 4-entry
  `ICON_MAP` is replaced by the shared 10-icon map so newly created categories
  render their chosen icon.
- `frontend/src/features/prayee/components/PrayeeSidebar/PrayeeSidebar.tsx` —
  owns `isAdding` state, passes `onAdd`, renders `AddPrayeeSheet`.
- `frontend/src/features/category/components/CategorySideBar/CategorySidebar.tsx` —
  same for categories.

**Why this split:** `BottomSheet` is in `components/` because it is generic
chrome with no domain knowledge. `IconPicker` lives under `features/category/`
because category is the only thing with an icon. The two sheets stay separate
rather than one parameterized "AddThingSheet" — they have different fields,
different validation, and different mutations; merging them would mean a
component full of `if (kind === 'category')` branches.

---

## Task 1: Case-insensitive unique names (migration)

The tables already have `UNIQUE (user_id, name)`, but Postgres compares text
case-sensitively — so a user could create both "Family" and "family". Replace
each constraint with a unique index on `lower(name)`.

**Files:**
- Create: `backend/functions/ops/migrate/sql/004_case_insensitive_names.sql`
- Reference (do not modify): `backend/functions/ops/migrate/sql/001_init.sql:11-27`

**Interfaces:**
- Consumes: nothing.
- Produces: unique indexes `prayees_user_lower_name_idx` and
  `categories_user_lower_name_idx`. A violating insert raises Postgres
  `SQLSTATE 23505`, which Tasks 2 and 3 catch by `err.code === "23505"`.

- [ ] **Step 1: Write the migration**

Create `backend/functions/ops/migrate/sql/004_case_insensitive_names.sql`:

```sql
-- Names must be unique per user, case-insensitively.
-- 001_init.sql created UNIQUE (user_id, name), which is case-SENSITIVE:
-- it would allow both "Family" and "family" for the same user.
-- Drop those constraints and replace with expression indexes on lower(name).

ALTER TABLE prayees
  DROP CONSTRAINT IF EXISTS prayees_user_id_name_key;

ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS categories_user_id_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS prayees_user_lower_name_idx
  ON prayees (user_id, lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS categories_user_lower_name_idx
  ON categories (user_id, lower(name));
```

Note on the constraint names: Postgres auto-names a table-level `UNIQUE (a, b)`
constraint `<table>_<col1>_<col2>_key`, so `UNIQUE (user_id, name)` on `prayees`
became `prayees_user_id_name_key`. Step 2 confirms this before you deploy.

- [ ] **Step 2: Confirm the real constraint names before migrating**

The `DROP CONSTRAINT` names above are predicted, not observed. Verify with the
existing `ops/query` Lambda:

```bash
aws lambda invoke \
  --function-name prixy-QueryFunction \
  --cli-binary-format raw-in-base64-out \
  --payload '{"sql":"SELECT conname, conrelid::regclass AS table FROM pg_constraint WHERE conrelid IN ('\''prayees'\''::regclass, '\''categories'\''::regclass) AND contype = '\''u'\''"}' \
  /dev/stdout
```

(If your deployed function name differs, get it with
`aws lambda list-functions --query "Functions[?contains(FunctionName, 'Query')].FunctionName"`.)

Expected: two rows, `prayees_user_id_name_key` and
`categories_user_id_name_key`. If the names differ, correct the SQL file to
match what came back — a wrong name is silently ignored by `IF EXISTS`, which
would leave the old case-sensitive constraint in place and make the whole
migration a no-op.

- [ ] **Step 3: Deploy and run the migration**

```bash
cd backend/infra
sam build && sam deploy
aws lambda invoke --function-name prixy-MigrateFunction /dev/stdout
```

Expected: `{"status":"ok","applied":[...]}` with an entry
`{"file":"004_case_insensitive_names.sql","status":"ok"}`.

Note: `ops/migrate` replays every file each run. `001`–`003` are already
idempotent, so re-running is safe.

- [ ] **Step 4: Verify the indexes exist**

```bash
aws lambda invoke \
  --function-name prixy-QueryFunction \
  --cli-binary-format raw-in-base64-out \
  --payload '{"sql":"SELECT indexname FROM pg_indexes WHERE indexname LIKE '\''%lower_name_idx'\''"}' \
  /dev/stdout
```

Expected: both `prayees_user_lower_name_idx` and
`categories_user_lower_name_idx`.

- [ ] **Step 5: Commit**

```bash
git add backend/functions/ops/migrate/sql/004_case_insensitive_names.sql
git commit -m "feat: case-insensitive unique names for prayees and categories"
```

---

## Task 2: POST /prayees Lambda

**Files:**
- Create: `backend/functions/prayees/create/index.js`
- Create: `backend/functions/prayees/create/package.json`
- Create: `backend/functions/prayees/create/Makefile`
- Modify: `backend/infra/template.yaml` (insert after `ListPrayeesFunction`,
  which ends at line 307)

**Interfaces:**
- Consumes: the `23505` unique violation from Task 1.
- Produces: `POST /prayees` accepting `{ name: string }` and returning
  `201` with `{ id, userId, name, createdAt }` — matching the `Prayee` type in
  `frontend/src/types/prayee.ts` exactly. Errors: `400 { message }` on empty
  name, `401` unauthenticated, `404` user not found, `409 { message }` on
  duplicate. Task 6 consumes this endpoint.

- [ ] **Step 1: Write the handler**

Create `backend/functions/prayees/create/index.js`:

```js
const { withClient } = require("./shared/db");

const MAX_NAME_LENGTH = 60;

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Invalid JSON body" }),
    };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Name is required" }),
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Name must be ${MAX_NAME_LENGTH} characters or fewer`,
      }),
    };
  }

  try {
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const created = await client.query(
        `INSERT INTO prayees (user_id, name)
         VALUES ($1, $2)
         RETURNING
           id,
           user_id    AS "userId",
           name,
           created_at AS "createdAt"`,
        [user.rows[0].id, name],
      );

      return { row: created.rows[0] };
    });

    if (result.notFound) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.row),
    };
  } catch (err) {
    // 23505 = unique_violation, from prayees_user_lower_name_idx
    if (err.code === "23505") {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You already have someone called "${name}".`,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
```

Why the message is written server-side: the frontend shows `message` verbatim,
so the copy lives in one place and every client gets the same wording.

- [ ] **Step 2: Write package.json**

Create `backend/functions/prayees/create/package.json` (mirrors
`prayers/create/package.json`):

```json
{
  "name": "prayees-create",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "pg": "^8.13.1",
    "@aws-sdk/rds-signer": "^3.687.0"
  }
}
```

- [ ] **Step 3: Write the Makefile**

Create `backend/functions/prayees/create/Makefile`. The target name must be
`build-<LogicalId>` where `<LogicalId>` is the SAM resource added in Step 4 —
SAM looks up the target by that exact name, and a mismatch fails the build with
a confusing "no rule to make target" error. Note the leading whitespace must be
**tabs**, not spaces:

```make
PROJECT_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))../../..)

build-CreatePrayeeFunction:
	cp -r ./* $(ARTIFACTS_DIR)
	cp -r $(PROJECT_ROOT)/shared $(ARTIFACTS_DIR)/shared
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
```

The `cp -r shared` line is what makes `require("./shared/db")` resolve at
runtime — `backend/shared/` is copied into each function's bundle at build
time rather than being a published package.

- [ ] **Step 4: Wire it into SAM**

In `backend/infra/template.yaml`, insert this immediately after the
`ListPrayeesFunction` block (which ends with `Authorizer: CognitoAuth` at line
307) and before `ListCategoriesFunction`:

```yaml
  CreatePrayeeFunction:
    Type: AWS::Serverless::Function
    Metadata:
      BuildMethod: makefile
    Properties:
      CodeUri: ../functions/prayees/create/
      Handler: index.handler
      VpcConfig: *dbVpcConfig
      Environment: *dbEnvironment
      Policies: *dbPolicies
      Events:
        CreatePrayee:
          Type: Api
          Properties:
            RestApiId: !Ref PrixyApi
            Path: /prayees
            Method: post
            Auth:
              Authorizer: CognitoAuth
```

The `*dbVpcConfig` / `*dbEnvironment` / `*dbPolicies` are YAML anchor
references defined earlier in the template — they give the function its VPC
placement, DB connection env vars, and IAM policies. Reuse them; do not inline
copies.

- [ ] **Step 5: Deploy**

```bash
cd backend/infra
sam build && sam deploy
```

Expected: `CreatePrayeeFunction` appears in the changeset as `Add`.

- [ ] **Step 6: Verify with curl**

You need a valid ID token. Grab one by logging into the app and reading it from
the auth store, or reuse whatever method you used when testing
`PATCH /prayers/:id`.

```bash
API=<your api base url>
TOKEN=<your id token>

# 1. Happy path
curl -s -w '\n%{http_code}\n' -X POST "$API/prayees" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Test Person"}'
```
Expected: `201` and `{"id":"...","userId":"...","name":"Test Person","createdAt":"..."}`

```bash
# 2. Exact duplicate
curl -s -w '\n%{http_code}\n' -X POST "$API/prayees" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Test Person"}'
```
Expected: `409` and `{"message":"You already have someone called \"Test Person\"."}`

```bash
# 3. Case-differing duplicate — this is what Task 1 bought you
curl -s -w '\n%{http_code}\n' -X POST "$API/prayees" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"test person"}'
```
Expected: `409`. If this returns `201`, the Task 1 migration did not take
effect — go back and check the constraint names from Task 1 Step 2.

```bash
# 4. Whitespace-only name
curl -s -w '\n%{http_code}\n' -X POST "$API/prayees" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"   "}'
```
Expected: `400` and `{"message":"Name is required"}`

```bash
# 5. No auth
curl -s -w '\n%{http_code}\n' -X POST "$API/prayees" \
  -H 'Content-Type: application/json' -d '{"name":"Nobody"}'
```
Expected: `401` (from API Gateway's Cognito authorizer, before your handler runs).

```bash
# 6. Clean up
curl -s "$API/prayees" -H "Authorization: $TOKEN"
```
Expected: the list includes exactly one "Test Person". Leave it or delete it
directly via `ops/query`; there is no DELETE endpoint in this plan.

- [ ] **Step 7: Commit**

```bash
git add backend/functions/prayees/create backend/infra/template.yaml
git commit -m "feat: add POST /prayees endpoint"
```

---

## Task 3: POST /categories Lambda

Same shape as Task 2 with one extra field (`icon`) and one extra column in the
response (`isDefault`). The code is repeated in full rather than referenced —
you may be reading this task without having read Task 2.

**Files:**
- Create: `backend/functions/categories/create/index.js`
- Create: `backend/functions/categories/create/package.json`
- Create: `backend/functions/categories/create/Makefile`
- Modify: `backend/infra/template.yaml` (insert after `ListCategoriesFunction`,
  which ends at line 327)

**Interfaces:**
- Consumes: the `23505` unique violation from Task 1.
- Produces: `POST /categories` accepting `{ name: string, icon?: string }` and
  returning `201` with `{ id, userId, name, icon, isDefault, createdAt }` —
  matching the `Category` type in `frontend/src/types/category.ts`. Errors:
  `400`, `401`, `404`, `409 { message }`. `isDefault` is always `false` for
  user-created categories (the column defaults to `false`; do not set it).
  Task 7 consumes this endpoint.

- [ ] **Step 1: Write the handler**

Create `backend/functions/categories/create/index.js`:

```js
const { withClient } = require("./shared/db");

const MAX_NAME_LENGTH = 60;

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Invalid JSON body" }),
    };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const icon = typeof body.icon === "string" && body.icon.trim().length > 0
    ? body.icon.trim()
    : null;

  if (name.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Name is required" }),
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Name must be ${MAX_NAME_LENGTH} characters or fewer`,
      }),
    };
  }

  try {
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const created = await client.query(
        `INSERT INTO categories (user_id, name, icon)
         VALUES ($1, $2, $3)
         RETURNING
           id,
           user_id    AS "userId",
           name,
           icon,
           is_default AS "isDefault",
           created_at AS "createdAt"`,
        [user.rows[0].id, name, icon],
      );

      return { row: created.rows[0] };
    });

    if (result.notFound) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.row),
    };
  } catch (err) {
    // 23505 = unique_violation, from categories_user_lower_name_idx
    if (err.code === "23505") {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You already have a category called "${name}".`,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
```

A deliberate non-decision: the handler does **not** validate that `icon` is one
of the ten allowed names. The icon list is a frontend curation concern, and
hardcoding it in the Lambda means a code deploy every time you add an icon.
`CategoryAvatar` already falls back to a `Tag` icon for any unrecognized value,
so a bad icon degrades gracefully rather than breaking a screen.

- [ ] **Step 2: Write package.json**

Create `backend/functions/categories/create/package.json`:

```json
{
  "name": "categories-create",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "pg": "^8.13.1",
    "@aws-sdk/rds-signer": "^3.687.0"
  }
}
```

- [ ] **Step 3: Write the Makefile**

Create `backend/functions/categories/create/Makefile`. The target name must
match the SAM logical id from Step 4 exactly. Leading whitespace must be
**tabs**:

```make
PROJECT_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))../../..)

build-CreateCategoryFunction:
	cp -r ./* $(ARTIFACTS_DIR)
	cp -r $(PROJECT_ROOT)/shared $(ARTIFACTS_DIR)/shared
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
```

- [ ] **Step 4: Wire it into SAM**

In `backend/infra/template.yaml`, insert this immediately after the
`ListCategoriesFunction` block (ends with `Authorizer: CognitoAuth` at line
327) and before `GetPrayerFunction`:

```yaml
  CreateCategoryFunction:
    Type: AWS::Serverless::Function
    Metadata:
      BuildMethod: makefile
    Properties:
      CodeUri: ../functions/categories/create/
      Handler: index.handler
      VpcConfig: *dbVpcConfig
      Environment: *dbEnvironment
      Policies: *dbPolicies
      Events:
        CreateCategory:
          Type: Api
          Properties:
            RestApiId: !Ref PrixyApi
            Path: /categories
            Method: post
            Auth:
              Authorizer: CognitoAuth
```

- [ ] **Step 5: Deploy**

```bash
cd backend/infra
sam build && sam deploy
```

- [ ] **Step 6: Verify with curl**

```bash
API=<your api base url>
TOKEN=<your id token>

# 1. Happy path with icon
curl -s -w '\n%{http_code}\n' -X POST "$API/categories" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Small Group","icon":"users"}'
```
Expected: `201`, and the body has `"icon":"users"` and `"isDefault":false`.

```bash
# 2. No icon — icon should be null, not the string "null"
curl -s -w '\n%{http_code}\n' -X POST "$API/categories" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"No Icon Test"}'
```
Expected: `201` with `"icon":null`.

```bash
# 3. Duplicate against a SEEDED default category
curl -s -w '\n%{http_code}\n' -X POST "$API/categories" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"family"}'
```
Expected: `409` and `{"message":"You already have a category called \"family\"."}`
— assuming `002_seed.sql` gave you a "Family" category. This confirms the
constraint spans seeded and user-created rows alike, and is case-insensitive.

```bash
# 4. Empty name
curl -s -w '\n%{http_code}\n' -X POST "$API/categories" \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":""}'
```
Expected: `400` and `{"message":"Name is required"}`

- [ ] **Step 7: Commit**

```bash
git add backend/functions/categories/create backend/infra/template.yaml
git commit -m "feat: add POST /categories endpoint"
```

---

## Task 4: Surface server error messages in apiClient

The current `apiClient` throws `new Error("API error 409: Conflict")` and drops
the server's `message` body entirely. Task 1–3 put careful copy in that body;
this task is what lets the UI show it. Without this, every duplicate looks like
an opaque "API error 409" to the user.

**Files:**
- Modify: `frontend/src/apis/apiClient.ts:8-20`

**Interfaces:**
- Consumes: the `{ message }` JSON bodies returned by Tasks 2 and 3.
- Produces: an exported `ApiError` class with `status: number` and the server's
  `message` as `.message`. Tasks 6 and 7 catch it via
  `err instanceof ApiError && err.status === 409`. Behavior for 401/403 is
  unchanged — still signs the user out.

- [ ] **Step 1: Add the ApiError class and use it in parseResponse**

In `frontend/src/apis/apiClient.ts`, replace the whole `parseResponse` function
(lines 8–20) with:

```ts
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    await useAuthStore.getState().signOut();
    throw new ApiError(
      response.status,
      'Your session expired. Please sign in again.',
    );
  }

  const text = await response.text();

  if (!response.ok) {
    // Handlers return { message } — prefer it over the bare status text so
    // the UI can show copy the server actually wrote.
    let message = `Something went wrong (${response.status}).`;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === 'string' && parsed.message.length > 0) {
        message = parsed.message;
      }
    } catch {
      // Non-JSON error body (e.g. an API Gateway HTML page) — keep the default.
    }
    throw new ApiError(response.status, message);
  }

  return (text.length > 0 ? JSON.parse(text) : undefined) as T;
}
```

Two things to notice. `response.text()` moved above the `!response.ok` check,
because a `Response` body can only be read once — reading it in the error branch
and again in the success branch would throw. And the `JSON.parse` is wrapped in
`try/catch` because API Gateway returns HTML for some failures (a 502, a
throttle), and an unparseable body should not mask the real status.

- [ ] **Step 2: Verify nothing regressed**

`ApiError extends Error`, so every existing `catch (err)` that reads
`err.message` still works — this change is additive. Confirm by running the app
and exercising an existing flow:

```bash
cd frontend && npx expo start
```

In the app: open a prayer, edit its text, save. Expected: it still saves
normally with no new errors in the Metro console.

Then force an error to see the new path — temporarily point
`EXPO_PUBLIC_API_BASE_URL` in `frontend/.env` at a bad path (append `/nope`),
reload, and open the home screen. Expected: the error surfaces as a message,
not a crash. **Restore `.env` before continuing.**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/apis/apiClient.ts
git commit -m "feat: surface server error messages via ApiError"
```

---

## Task 5: API functions, mutation hooks, and the icon constant

Pure plumbing, no UI. Grouped into one task because none of these three pieces
is independently reviewable — they exist only to be consumed by Tasks 6 and 7.

**Files:**
- Create: `frontend/src/constants/categoryIcons.ts`
- Modify: `frontend/src/constants/index.ts`
- Modify: `frontend/src/apis/prayee.api.ts`
- Modify: `frontend/src/apis/category.api.ts`
- Create: `frontend/src/hooks/TanStack/useCreatePrayeeMutation.ts`
- Create: `frontend/src/hooks/TanStack/useCreateCategoryMutation.ts`
- Modify: `frontend/src/components/CategoryAvatar/CategoryAvatar.tsx`

**Interfaces:**
- Consumes: `ApiError` from Task 4; `POST /prayees` and `POST /categories` from
  Tasks 2 and 3; the existing query keys `['prayees']` (from
  `usePrayeesQuery.ts`) and `['categories']` (from `useCategoriesQuery.ts`).
- Produces:
  - `CATEGORY_ICONS: readonly CategoryIcon[]` where
    `CategoryIcon = { name: string; label: string; Icon: LucideIcon }`
  - `CATEGORY_ICON_MAP: Record<string, LucideIcon>`
  - `DEFAULT_CATEGORY_ICON: string` (`'users'`)
  - `createPrayee(input: { name: string }): Promise<Prayee>`
  - `createCategory(input: { name: string; icon: string }): Promise<Category>`
  - `useCreatePrayeeMutation()` and `useCreateCategoryMutation()`, both standard
    `useMutation` results that invalidate their list query on success.

- [ ] **Step 1: Verify the query key used by usePrayeesQuery**

The prayee query key must match exactly or invalidation silently does nothing.
Read it:

```bash
cat frontend/src/hooks/TanStack/usePrayeesQuery.ts
```

Expected: a `queryKey` of `['prayees']`. If it differs, use whatever it actually
is in Step 4 below. (`useCategoriesQuery` is confirmed to use `['categories']`.)

- [ ] **Step 2: Create the icon constant**

Create `frontend/src/constants/categoryIcons.ts`:

```ts
import {
  Users,
  User,
  Heart,
  Church,
  BookOpen,
  Home,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Globe,
} from 'lucide-react-native';

import type { LucideIcon } from 'lucide-react-native';

export type CategoryIcon = {
  /** Stored verbatim in Category.icon. Never rename — it is persisted data. */
  name: string;
  /** Accessibility label; not shown as visible text in the grid. */
  label: string;
  Icon: LucideIcon;
};

export const CATEGORY_ICONS: readonly CategoryIcon[] = [
  { name: 'users', label: 'Group', Icon: Users },
  { name: 'user', label: 'Person', Icon: User },
  { name: 'heart', label: 'Loved ones', Icon: Heart },
  { name: 'church', label: 'Church', Icon: Church },
  { name: 'book-open', label: 'Scripture', Icon: BookOpen },
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'briefcase', label: 'Work', Icon: Briefcase },
  { name: 'graduation-cap', label: 'School', Icon: GraduationCap },
  { name: 'stethoscope', label: 'Health', Icon: Stethoscope },
  { name: 'globe', label: 'Missions', Icon: Globe },
] as const;

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map((entry) => [entry.name, entry.Icon]),
);

export const DEFAULT_CATEGORY_ICON = 'users';
```

The `name` values are kebab-case to match lucide's own naming, and the four
already in use by the seeded categories (`church`, `home`, `users`, `heart`)
are preserved exactly — changing them would orphan the seeded rows' icons.

- [ ] **Step 3: Re-export from the constants barrel**

Check how `frontend/src/constants/index.ts` re-exports, then add a matching
line. If it uses `export * from './colors';` style, add:

```ts
export * from './categoryIcons';
```

If it uses named re-exports instead, follow that style. Either way, the goal is
that `import { CATEGORY_ICONS } from '@/constants'` resolves.

- [ ] **Step 4: Add the API functions**

Replace `frontend/src/apis/prayee.api.ts` entirely:

```ts
import apiFetch from './apiClient';

import type { Prayee } from '@/types/prayee';

export async function fetchPrayee(): Promise<Prayee[]> {
  return apiFetch<Prayee[]>(`/prayees`);
}

export async function createPrayee(input: { name: string }): Promise<Prayee> {
  return apiFetch<Prayee>(`/prayees`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

Replace `frontend/src/apis/category.api.ts` entirely:

```ts
import apiFetch from './apiClient';

import type { Category } from '@/types/category';

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/categories`);
}

export async function createCategory(input: {
  name: string;
  icon: string;
}): Promise<Category> {
  return apiFetch<Category>(`/categories`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

- [ ] **Step 5: Add the mutation hooks**

Create `frontend/src/hooks/TanStack/useCreatePrayeeMutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPrayee } from '@/apis/prayee.api';

export const useCreatePrayeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrayee,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayees'] });
    },
  });
};
```

Create `frontend/src/hooks/TanStack/useCreateCategoryMutation.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCategory } from '@/apis/category.api';

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
```

Deliberately not optimistic (your decision): `invalidateQueries` triggers a
refetch, so the new row appears a beat after the server confirms. Simple, always
consistent with the server, and it mirrors how `useCreatePrayerRequestMutation`
already works in this codebase.

- [ ] **Step 6: Point CategoryAvatar at the shared icon map**

`CategoryAvatar` currently has its own 4-entry `ICON_MAP`, so a category created
with `stethoscope` would render the generic `Tag` fallback. Replace the top of
`frontend/src/components/CategoryAvatar/CategoryAvatar.tsx` — the imports and
the `ICON_MAP`/`IconName`/`isIconName` block — with:

```tsx
import { Pressable } from 'react-native';
import { Tag } from 'lucide-react-native';

import { COLORS, CATEGORY_ICON_MAP } from '@/constants';
import { styles } from './CategoryAvatar.styles';
```

and replace the icon-resolution line inside the component:

```tsx
const Icon = (icon && CATEGORY_ICON_MAP[icon]) || Tag;
```

Delete the now-unused `ICON_MAP`, `IconName`, and `isIconName`. The rest of the
component — the `borderWidth` / `innerSize` / `iconSize` math and the JSX — is
unchanged. `Tag` remains the fallback for a null or unrecognized icon.

- [ ] **Step 7: Typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors. A "Cannot find module '@/constants'" here means Step 3's
barrel export is wrong.

- [ ] **Step 8: Verify the app still renders categories**

```bash
cd frontend && npx expo start
```

Open a prayer → tap the category chip. Expected: the sidebar lists your seeded
categories with their icons rendering exactly as before (Family, Friends,
Church). If any now show a generic tag, the `name` strings in
`categoryIcons.ts` don't match what's in the DB — check with
`curl "$API/categories" -H "Authorization: $TOKEN"`.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/constants frontend/src/apis frontend/src/hooks/TanStack frontend/src/components/CategoryAvatar
git commit -m "feat: add prayee/category create API, hooks, and shared icon set"
```

---

## Task 6: BottomSheet shell + Add Prayee sheet

The first visible piece. Builds the generic sheet chrome, then the simpler of
the two forms on top of it, and wires the prayee sidebar's add pill.

**Files:**
- Create: `frontend/src/components/BottomSheet/BottomSheet.tsx`
- Create: `frontend/src/components/BottomSheet/BottomSheet.styles.ts`
- Create: `frontend/src/features/prayee/components/AddPrayeeSheet/AddPrayeeSheet.tsx`
- Create: `frontend/src/features/prayee/components/AddPrayeeSheet/AddPrayeeSheet.styles.ts`
- Modify: `frontend/src/components/Sidebar/Sidebar.tsx:17-47`
- Modify: `frontend/src/components/Sidebar/Sidebar.styles.ts` (add one style)
- Modify: `frontend/src/features/prayee/components/PrayeeSidebar/PrayeeSidebar.tsx`
- Modify: `frontend/src/features/category/components/CategorySideBar/CategorySidebar.tsx`
  (add a placeholder `onAdd` — `Sidebar` now requires the prop, so this file
  must change in the same commit or TypeScript fails)

**Interfaces:**
- Consumes: `useCreatePrayeeMutation` and `ApiError` from Tasks 4–5.
- Produces:
  - `BottomSheet` with props
    `{ visible: boolean; title: string; saveLabel?: string; canSave: boolean; isSaving: boolean; onCancel: () => void; onSave: () => void; children: React.ReactNode }`.
    Task 7 reuses it unchanged.
  - `Sidebar` gains a required `onAdd: () => void` prop.

- [ ] **Step 1: Build the BottomSheet styles**

Create `frontend/src/components/BottomSheet/BottomSheet.styles.ts`:

```ts
import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.tint,
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderOne,
  },

  title: {
    color: COLORS.accent,
    ...fontFamily(800),
    fontSize: 17,
  },

  action: {
    minWidth: 60,
    color: COLORS.accent,
    fontSize: 16,
  },

  actionCancel: {
    color: COLORS.secondaryText,
    textAlign: 'left',
  },

  actionSave: {
    textAlign: 'right',
  },

  actionDisabled: {
    opacity: 0.35,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
});
```

- [ ] **Step 2: Build the BottomSheet component**

Create `frontend/src/components/BottomSheet/BottomSheet.tsx`:

```tsx
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS } from '@/constants';
import { styles } from './BottomSheet.styles';

type BottomSheetProp = {
  visible: boolean;
  title: string;
  saveLabel?: string;
  canSave: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

const BottomSheet = ({
  visible,
  title,
  saveLabel = 'Save',
  canSave,
  isSaving,
  onCancel,
  onSave,
  children,
}: BottomSheetProp) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onCancel}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.header}>
              <Pressable onPress={onCancel} disabled={isSaving}>
                <Text style={[styles.action, styles.actionCancel]}>Cancel</Text>
              </Pressable>

              <Text style={styles.title}>{title}</Text>

              {isSaving ? (
                <View style={styles.action}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                </View>
              ) : (
                <Pressable onPress={onSave} disabled={!canSave}>
                  <Text
                    style={[
                      styles.action,
                      styles.actionSave,
                      !canSave && styles.actionDisabled,
                    ]}
                  >
                    {saveLabel}
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={styles.body}>{children}</View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheet;
```

Two mechanics worth understanding. The nested-`Pressable` trick — outer catches
backdrop taps to dismiss, inner swallows taps so tapping the sheet itself
doesn't close it — is the same pattern `Sidebar.tsx:39-40` already uses.
`KeyboardAvoidingView` matters because this is a bottom sheet with a text
input: without it the iOS keyboard covers the field.

- [ ] **Step 3: Make the Sidebar add pill functional**

In `frontend/src/components/Sidebar/Sidebar.tsx`, add `onAdd` to the type (after
`onSelect`):

```tsx
  onSelect: (id: string) => void;
  onAdd: () => void;
  exit: () => void;
```

Add it to the destructured params, then replace the add `Pressable` (lines
43–46) so it actually calls the handler:

```tsx
          <Pressable
            style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
            onPress={onAdd}
          >
            <Plus size={24} color="#9CA3AF" />
            <Text style={styles.addText}>{addLabel}</Text>
          </Pressable>
```

In `frontend/src/components/Sidebar/Sidebar.styles.ts`, add after `add`:

```ts
  addPressed: {
    opacity: 0.6,
  },
```

- [ ] **Step 4: Build the AddPrayeeSheet styles**

Create `frontend/src/features/prayee/components/AddPrayeeSheet/AddPrayeeSheet.styles.ts`:

```ts
import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  label: {
    color: COLORS.secondaryText,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
    ...fontFamily(600),
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.borderOne,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.primaryText,
    backgroundColor: COLORS.primaryBg,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  error: {
    marginTop: 8,
    color: COLORS.dangerText,
    fontSize: 13,
  },
});
```

- [ ] **Step 5: Build the AddPrayeeSheet component**

Create `frontend/src/features/prayee/components/AddPrayeeSheet/AddPrayeeSheet.tsx`:

```tsx
import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';

import { ApiError } from '@/apis/apiClient';
import { useCreatePrayeeMutation } from '@/hooks/TanStack/useCreatePrayeeMutation';
import { COLORS } from '@/constants';
import { styles } from './AddPrayeeSheet.styles';

type AddPrayeeSheetProp = {
  visible: boolean;
  onClose: () => void;
};

const AddPrayeeSheet = ({ visible, onClose }: AddPrayeeSheetProp) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreatePrayeeMutation();

  const trimmed = name.trim();

  const close = () => {
    setName('');
    setError(null);
    onClose();
  };

  const handleChange = (value: string) => {
    setName(value);
    // Clear a stale duplicate warning as soon as they start fixing it.
    if (error) setError(null);
  };

  const handleSave = () => {
    if (trimmed.length === 0 || isPending) return;

    mutate(
      { name: trimmed },
      {
        onSuccess: close,
        onError: (err) => {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Could not add this name. Please try again.',
          );
        },
      },
    );
  };

  return (
    <BottomSheet
      visible={visible}
      title="Add a name"
      canSave={trimmed.length > 0}
      isSaving={isPending}
      onCancel={close}
      onSave={handleSave}
    >
      <View>
        <Text style={styles.label}>NAME</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={name}
          onChangeText={handleChange}
          placeholder="e.g. Sarah Miller"
          placeholderTextColor={COLORS.secondaryText}
          autoFocus
          autoCapitalize="words"
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!isPending}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </BottomSheet>
  );
};

export default AddPrayeeSheet;
```

Note `maxLength={60}` matches the Lambda's `MAX_NAME_LENGTH` — the client stops
you before the server has to. The server check stays anyway; client validation
is UX, not security.

Note also what the error state does *not* do: it doesn't clear the field. The
user typed "Sarah" and got told Sarah exists — leaving the text there lets them
edit it to "Sarah M." rather than retyping.

- [ ] **Step 6: Wire up PrayeeSidebar**

Replace `frontend/src/features/prayee/components/PrayeeSidebar/PrayeeSidebar.tsx`
entirely:

```tsx
import { useState } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddPrayeeSheet from '../AddPrayeeSheet/AddPrayeeSheet';

import { usePrayeeQuery } from '@/hooks/TanStack/usePrayeesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

type PrayeeSidebarProp = {
  prayerId: string;
  onClose: () => void;
};

const PrayeeSidebar = ({ prayerId, onClose }: PrayeeSidebarProp) => {
  const [isAdding, setIsAdding] = useState(false);

  const { data: prayees, isPending, isError } = usePrayeeQuery();

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (prayeeId: string) => {
    mutate({ id: prayerId, prayeeId }, { onSuccess: onClose });
  };

  return (
    <>
      <Sidebar
        title="Praying For"
        addLabel="Add a name"
        items={prayees}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving}
        onSelect={handleSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      <AddPrayeeSheet visible={isAdding} onClose={() => setIsAdding(false)} />
    </>
  );
};

export default PrayeeSidebar;
```

The sidebar stays mounted behind the sheet, so closing the sheet reveals the
list with the new name already in it — that's the "stay open" behavior you
chose.

- [ ] **Step 7: Keep CategorySidebar compiling**

`Sidebar` now requires `onAdd`, so `CategorySidebar` won't typecheck. Add a
temporary no-op — Task 7 replaces it. In
`frontend/src/features/category/components/CategorySideBar/CategorySidebar.tsx`,
add one line to the `<Sidebar>` props, after `onSelect`:

```tsx
        onAdd={() => {}}
```

- [ ] **Step 8: Typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Verify on device**

```bash
cd frontend && npx expo start
```

Walk through each of these:

1. Open a prayer → tap the prayee chip. Expected: sidebar slides in.
2. Tap "Add a name". Expected: bottom sheet rises, keyboard appears, cursor in
   the field, "Save" is dimmed.
3. Type a space only. Expected: Save stays dimmed (trim check).
4. Type "Test Person One". Expected: Save becomes fully opaque.
5. Tap Save. Expected: brief spinner where Save was, sheet closes, **sidebar is
   still open**, and "Test Person One" now appears in the list.
6. Tap "Add a name" again, type "test person one" (different case), Save.
   Expected: sheet stays open, field border turns red, and the message
   *"You already have someone called "test person one"."* appears below it.
   **This is the key check in this task** — it exercises Task 1's index, Task
   2's 409, and Task 4's ApiError together.
7. Edit the text to "Test Person Two". Expected: the red error clears as soon
   as you type.
8. Tap Save. Expected: succeeds, sheet closes, both names in the list.
9. Tap the backdrop above the sheet (before saving something). Expected: sheet
   closes, nothing created, sidebar still open.
10. Tap "Test Person One" in the list. Expected: it assigns to the prayer and
    the sidebar closes — the pre-existing select behavior, unchanged.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/BottomSheet frontend/src/components/Sidebar frontend/src/features/prayee frontend/src/features/category
git commit -m "feat: add prayee via bottom sheet from sidebar"
```

---

## Task 7: Icon picker + Add Category sheet

**Files:**
- Create: `frontend/src/features/category/components/IconPicker/IconPicker.tsx`
- Create: `frontend/src/features/category/components/IconPicker/IconPicker.styles.ts`
- Create: `frontend/src/features/category/components/AddCategorySheet/AddCategorySheet.tsx`
- Create: `frontend/src/features/category/components/AddCategorySheet/AddCategorySheet.styles.ts`
- Modify: `frontend/src/features/category/components/CategorySideBar/CategorySidebar.tsx`

**Interfaces:**
- Consumes: `BottomSheet` (Task 6), `CATEGORY_ICONS` / `DEFAULT_CATEGORY_ICON`
  (Task 5), `useCreateCategoryMutation` (Task 5), `ApiError` (Task 4),
  `CategoryAvatar` (existing, updated in Task 5).
- Produces: nothing consumed by a later task. This is the last one.

- [ ] **Step 1: Build the IconPicker styles**

Create `frontend/src/features/category/components/IconPicker/IconPicker.styles.ts`:

```ts
import { StyleSheet } from 'react-native';

import { COLORS } from '@/constants';

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  option: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBg,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  optionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.primary,
  },
});
```

The unselected state carries a 2px *transparent* border rather than no border,
so selecting an icon doesn't shift the grid layout by 4px.

- [ ] **Step 2: Build the IconPicker component**

Create `frontend/src/features/category/components/IconPicker/IconPicker.tsx`:

```tsx
import { View, Pressable } from 'react-native';

import { CATEGORY_ICONS, COLORS } from '@/constants';
import { styles } from './IconPicker.styles';

type IconPickerProp = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

const IconPicker = ({ value, onChange, disabled }: IconPickerProp) => {
  return (
    <View style={styles.grid}>
      {CATEGORY_ICONS.map(({ name, label, Icon }) => {
        const isSelected = name === value;

        return (
          <Pressable
            key={name}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onChange(name)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSelected }}
          >
            <Icon
              size={24}
              color={isSelected ? COLORS.accent : COLORS.primaryText}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default IconPicker;
```

Ten icons at 52px + 12px gap wrap to two rows of five on a standard phone width
with the sheet's 16px padding — no scrolling needed, which is why this is a
plain wrapping `View` and not a `FlatList`.

- [ ] **Step 3: Build the AddCategorySheet styles**

Create `frontend/src/features/category/components/AddCategorySheet/AddCategorySheet.styles.ts`:

```ts
import { StyleSheet } from 'react-native';

import { COLORS, fontFamily } from '@/constants';

export const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    marginBottom: 20,
  },

  label: {
    color: COLORS.secondaryText,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
    ...fontFamily(600),
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.borderOne,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.primaryText,
    backgroundColor: COLORS.primaryBg,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  error: {
    marginTop: 8,
    color: COLORS.dangerText,
    fontSize: 13,
  },

  iconSection: {
    marginTop: 24,
  },
});
```

- [ ] **Step 4: Build the AddCategorySheet component**

Create `frontend/src/features/category/components/AddCategorySheet/AddCategorySheet.tsx`:

```tsx
import { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';
import CategoryAvatar from '@/components/CategoryAvatar/CategoryAvatar';
import IconPicker from '../IconPicker/IconPicker';

import { ApiError } from '@/apis/apiClient';
import { useCreateCategoryMutation } from '@/hooks/TanStack/useCreateCategoryMutation';
import { COLORS, DEFAULT_CATEGORY_ICON } from '@/constants';
import { styles } from './AddCategorySheet.styles';

type AddCategorySheetProp = {
  visible: boolean;
  onClose: () => void;
};

const AddCategorySheet = ({ visible, onClose }: AddCategorySheetProp) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateCategoryMutation();

  const trimmed = name.trim();

  const close = () => {
    setName('');
    setIcon(DEFAULT_CATEGORY_ICON);
    setError(null);
    onClose();
  };

  const handleChange = (value: string) => {
    setName(value);
    if (error) setError(null);
  };

  const handleSave = () => {
    if (trimmed.length === 0 || isPending) return;

    mutate(
      { name: trimmed, icon },
      {
        onSuccess: close,
        onError: (err) => {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Could not add this category. Please try again.',
          );
        },
      },
    );
  };

  return (
    <BottomSheet
      visible={visible}
      title="Add a Category"
      canSave={trimmed.length > 0}
      isSaving={isPending}
      onCancel={close}
      onSave={handleSave}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          <CategoryAvatar icon={icon} size={64} />
        </View>

        <Text style={styles.label}>NAME</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={name}
          onChangeText={handleChange}
          placeholder="e.g. Small Group"
          placeholderTextColor={COLORS.secondaryText}
          autoFocus
          autoCapitalize="words"
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!isPending}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.iconSection}>
          <Text style={styles.label}>ICON</Text>
          <IconPicker value={icon} onChange={setIcon} disabled={isPending} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

export default AddCategorySheet;
```

Three deliberate choices. The icon defaults to `users` rather than nothing, so
a user who only cares about the name never has to touch the grid — the Mobbin
set (Monzo, stoic.) all preselect. `CategoryAvatar` is reused as the live
preview instead of a bespoke component, which guarantees the preview looks
exactly like the row that will appear in the list. And
`keyboardShouldPersistTaps="handled"` on the `ScrollView` is what lets a tap on
an icon register while the keyboard is up — without it the first tap only
dismisses the keyboard.

- [ ] **Step 5: Wire up CategorySidebar**

Replace `frontend/src/features/category/components/CategorySideBar/CategorySidebar.tsx`
entirely (this also removes the Task 6 Step 7 placeholder `onAdd`):

```tsx
import { useState } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddCategorySheet from '../AddCategorySheet/AddCategorySheet';

import { useCategoriesQuery } from '@/hooks/TanStack/useCategoriesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

type CategorySidebarProp = {
  prayerId: string;
  onClose: () => void;
};

const CategorySidebar = ({ prayerId, onClose }: CategorySidebarProp) => {
  const [isAdding, setIsAdding] = useState(false);

  const { data: category, isPending, isError } = useCategoriesQuery();

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (categoryId: string) => {
    mutate({ id: prayerId, categoryId }, { onSuccess: onClose });
  };

  return (
    <>
      <Sidebar
        title="Category"
        addLabel="Add a Category"
        items={category}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving}
        onSelect={handleSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      <AddCategorySheet visible={isAdding} onClose={() => setIsAdding(false)} />
    </>
  );
};

export default CategorySidebar;
```

- [ ] **Step 6: Typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Verify on device**

```bash
cd frontend && npx expo start
```

1. Open a prayer → tap the category chip → tap "Add a Category". Expected:
   sheet rises with a circled `users` icon preview at top, empty name field
   focused, and a two-row grid of 10 icons below. Save is dimmed.
2. Tap the `stethoscope` icon. Expected: it gets an accent ring, the other
   icons lose theirs, **and the preview at the top changes to a stethoscope.**
3. Type "Health". Expected: Save becomes fully opaque.
4. Tap Save. Expected: spinner, sheet closes, sidebar still open, and a
   "Health" row with a stethoscope icon appears in the list. The stethoscope
   rendering (not a generic tag) confirms Task 5 Step 6 worked.
5. Tap "Add a Category", type "health" (lowercase), Save. Expected: sheet stays
   open, red border, message *"You already have a category called "health"."*
6. Change it to "Healing", Save. Expected: succeeds.
7. Tap "Add a Category", type a name, do **not** touch the icon grid, Save.
   Expected: created with the default `users` icon.
8. Tap "Add a Category", pick an icon, type a name, then tap Cancel. Reopen.
   Expected: the form is fully reset — empty name, `users` icon, no error. (This
   checks the `close()` reset.)
9. Tap the new "Health" row. Expected: assigns to the prayer, sidebar closes,
   and the chip on the prayer screen shows the stethoscope.
10. Fully reload the app and open the category sidebar again. Expected: "Health"
    persists with its icon — confirming it round-tripped through Postgres.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/category
git commit -m "feat: add category with icon picker via bottom sheet"
```

---

## Self-Review Notes

**Spec coverage** (`docs/system-design.md` §4):
- `POST /prayees` `{ name }` → `Prayee` — Task 2. ✅
- `POST /categories` `{ name, icon }` → `Category` — Task 3. ✅
- §5 "Prayee chip → opens Praying For picker (`GET`/`POST /prayees`)" — Tasks
  6–7 wire the `POST` half; the `GET` half already existed. ✅
- No spec update needed: this plan implements the API table verbatim.

**Type consistency check:**
- `Prayee` response fields (`id`, `userId`, `name`, `createdAt`) — Task 2's
  `RETURNING` aliases match `frontend/src/types/prayee.ts` exactly.
- `Category` response fields (`id`, `userId`, `name`, `icon`, `isDefault`,
  `createdAt`) — Task 3's `RETURNING` aliases match
  `frontend/src/types/category.ts` exactly.
- `ApiError` is defined in Task 4, imported in Tasks 6 and 7 as
  `import { ApiError } from '@/apis/apiClient'` — it is a named export, while
  `apiFetch` remains the default export.
- `CATEGORY_ICON_MAP` (Task 5 Step 2) is consumed by `CategoryAvatar` (Task 5
  Step 6); `CATEGORY_ICONS` by `IconPicker` (Task 7);
  `DEFAULT_CATEGORY_ICON` by `AddCategorySheet` (Task 7).
- `BottomSheet` props are defined in Task 6 Step 2 and used identically in Task
  6 Step 5 and Task 7 Step 4.
- SAM logical ids `CreatePrayeeFunction` / `CreateCategoryFunction` match their
  Makefile `build-` targets in Tasks 2 and 3.

**Known ordering constraint:** Task 6 Step 7 adds a throwaway `onAdd={() => {}}`
to `CategorySidebar` purely so the tree typechecks between Tasks 6 and 7. Task 7
Step 5 removes it. Do not skip Task 6 Step 7, and do not leave it in place after
Task 7.
