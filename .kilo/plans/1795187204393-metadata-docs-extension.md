# Extend `docs/metadata/` with client-side insights from the standard-metadata export

## Context

- `docs/metadata/` (8 files) is complete and verified against source; main `README.md` links it. Do not restructure it.
- The user supplied `tmp/metadata-entities.json` — an export of the **standard metadata** (the 20 backend tables that model metadata editing in the app: `page`, `entity`, `lookup`, `pickvalue`, `statistic`, `tenant`, `role`, `user`, `document`, `documentation`, `job`, `notification`, `subscription`, `processingstate`, `mlmodel`, `entityright`, `chunk`, `context`, `embedding`, `origin`).
- **The export itself must not become part of the docs** — no references to `tmp/metadata-entities.json` in any doc file.
- The export mixes client metadata and backend metadata. **Out of scope (backend services document these):** `ListQuery`/`ByIdQuery`/`NewQuery`/`ScalarValueQuery` SQL variant arrays and `@tenantId`/`@id` params, `SaveStatement`/`RemoveStatement`, `States`/`Successors`/`RecordFinished`/`RecordLocked`/`ReasonRequired`, `StateAllowedScript`, `ProviderModelDefinition`/`GeneratedSchema`/`Indices`, `NoIdentity`, entity `Rights` catalog arrays (`meta.<entity>.<op>`), `__KEY__` markers, backend-computed `Editable*` data members, lookup/statistic `ListQuery`/`ByIdQuery`/`FetchSql`/`FetchScript`, tenant `Server`/`Catalog`/`Schema`/`User`/`Password`/`ReportSchemaDefinition`/`ServerScriptDefinitions`. None of these have any reference in frontend code (verified via repo-wide grep) — leave them undocumented.
- Decision: **no new doc file**; fold the two in-scope findings into existing files as targeted additions.

## In-scope findings (verified against frontend source)

### A. Built-in lookups registered by the client (main finding)

`libs/ngrx-meta-services/src/lib/lookup/lookup.store.ts` — `requestLookups` (lines 519-536) injects **17 built-in lookup identifiers** into the lookup state on **every** lookup-request batch, independent of the entity's `Lookups`/`Picklists` envelope fields. Layouts and grid columns can reference them via the normal `lookup` option anywhere (evidence: standard metadata uses `lookup:'lookupLookup'`, `lookup:'entityLookup'`, `lookup:'userLookup'` in detail-grid columns).

| Identifier | Backed by | valueMember / displayMember |
|---|---|---|
| `userLookup` | `IdentityUserApi` | `id` / `name` |
| `roleLookup` | `IdentityRoleApi` | `id` / `name` |
| `documentLookup` | `MetaDocumentApi` | `Id` / `Name` |
| `documentationLookup` | `MetaDocumentationApi` | `Id` / `Name` |
| `entityLookup` | `MetaEntityApi` | `Id` / `Name` |
| `lookupLookup` | `MetaLookupApi` | `Id` / `Name` |
| `mlmodelLookup` | `MetaMlModelApi` | `Id` / `Name` |
| `notificationLookup` | `MetaNotificationApi` | `Id` / `Name` |
| `pageLookup` | `MetaPageApi` | `Id` / `Name` |
| `processingstateLookup` | `MetaProcessingstateApi` | `Id` / `Name` |
| `statisticLookup` | `MetaStatisticApi` | `Id` / `Name` |
| `subscriptionLookup` | `MetaSubscriptionApi` | `Id` / `Name` |
| `tenantLookup` | `MetaTenantApi` | `Id` / `Name` |
| `entityIdentifierLookup` | `MetaEntityApi` | `Entity` / `Name` |
| `entityRightLookup` | `MetaEntityApi.rightSelectList()` / `rightSelectById(id)` (endpoints `entity/selectlistrights`, `entity/rightselectbyid/{id}` — `libs/rest-meta-api/src/lib/entity.ts:158,165`) | `Id` / `DisplayName` |
| `entityStateLookup` | `MetaProcessingstateApi.selectListForEntity(param)` — **LookupCreator**: the lookup param is the **entity name** (works with `customParam`-style params) | `State` / `Name` |
| `entityPickvalueLookup` | `MetaPickvalueApi.selectListForEntityAndField(entity, field)` — PickvalueCreator `(entity, field)` | from response |

Related mechanics to mention: these sit in the same map as entity lookups (`lookupbuilder.ts:348` resolves `lookups[identifier]`); entity `Lookups` entries with the same identifier are added in the same `requestLookups` batch **after** the built-ins, so **entity definitions shadow built-ins** — verify ordering in `lookup.store.ts:538-620` and `updateLookups` (`:500-504`) before writing the claim.

### B. Standard scripting recipes observed in standard metadata (illustrate already-documented hooks)

From the export's `CustomScripts` (genericized; do not copy backend-specific examples like `providermodel`):

1. `initNewDetailItem`: seed defaults for newly added detail-grid items — branch on `dataMember`, set `detailItem.Id = util.uuid()`, copy parent fields (`item.TenantId`, `item.Entity`), default flags.
2. `editorPreparing`: rewrite `layoutItem.itemoptions` per tab/identifier — assign `{ query, layout, headParams, customParam, uniqueKey, fetchParams }`. **Caveat to keep consistent with existing docs:** `uniqueKey`/`fetchParams` are declared-but-never-read on `entitygrid` (`edit-forms.md:219`); the recipe text must not imply they have effect — show only `query`/`layout`/`headParams`/`customParam`/`readOnly` as effective, and cross-link the caveat.

## Tasks

1. **`docs/metadata/entities-and-crud.md`** — insert subsection **“Built-in lookups”** after “Lookups and picklists”:
   - The table above (trim to essential columns), citing `lookup.store.ts:519-536` and `:235-282` for the four entity-scoped creators.
   - Note: registered on every lookup request batch; available in any layout/grid/edit form like the auto state lookups; entity `Lookups` shadow built-ins (verify first).
   - Note: `entityStateLookup` requires the **entity name** as lookup param (`lookupParam` / creator param), `entityPickvalueLookup` takes `(entity, field)`.
   - Add one strict-JSON example line to the existing example block context (e.g. grid column or `Lookups` contrast showing `lookup: "userLookup"` used without a `Lookups` entry).
2. **`docs/metadata/scripting.md`** — extend the hook descriptions (or add a short “Practical recipes” block near the end before Caveats) with the two genericized examples from B, in strict JSON / plain script strings exactly as the docs format them. Confirm exact hook signatures from `libs/meta-scripting/src/lib/` before writing (`initNewDetailItem`, `editorPreparing` arg lists).
3. **`docs/metadata/lists.md` and `docs/metadata/edit-forms.md`** — one-line cross-links to the new “Built-in lookups” subsection where lookup identifiers are resolved (grid columns, editor `lookup` option). No other changes.
4. **No changes** to `statistics.md`, `navigation.md`, `custom-functions.md`, docs `README.md` topic table content (no new file). Main `README.md` untouched.

## Constraints

- Do not reference `tmp/metadata-entities.json` anywhere in the docs.
- All added examples must be **strict JSON** where embedded (parseable by `JSON.parse`), matching existing docs conventions (JSON5 caveat already documented in README).
- Keep the existing “Caveats (verified against source)” style: every claim gets a file:line citation.
- English, matching existing docs tone; no backend-side fields (see out-of-scope list).
- Repo hygiene: leave the three pre-staged files (`playwright-output/.last-run.json`, `apps/webclient/__.env.local`, `apps/webclient/__.env.netcup`) untouched; do not commit unless asked.

## Verification

1. `JSON.parse` check of every added embedded-JSON example (same approach as before: extract fenced ```json blocks and parse).
2. Every file:line citation re-checked against source (lookup.store.ts lines, meta-scripting hook signatures, rest-meta-api endpoint lines).
3. Internal link check across `docs/metadata/` (strip `#fragment` before resolving).
4. `git status` shows only modifications under `docs/metadata/` (no new files, no other repo changes).
5. Grep the docs for `Editable`, `ListQuery`, `SaveStatement`, `Successors`, `__KEY__`, `tmp/metadata` → must return nothing (scope guard).

## Risks / notes for the executor

- Shadowing order (entity lookups vs built-ins) must be verified in `lookup.store.ts:538-634` + `lookup.state.ts` before being stated as fact; if unclear, phrase as “same identifier collides — last registration wins per batch” only if verified.
- `entityIdentifierLookup` valueMember is the entity **name** string while others return ids — document explicitly to avoid misuse.
- If the executor finds the built-ins are only wired when meta APIs are provided (check `apps/webclient/src/app/app.config.ts` / `apps/metadesign`), add one caveat sentence; current evidence: registration is unconditional inside `requestLookups`.
