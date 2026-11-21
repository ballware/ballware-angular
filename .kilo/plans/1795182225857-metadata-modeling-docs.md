# Plan: Metadata Modeling Documentation (docs/metadata/)

## Context

`README.md` covers setup/operation of the Ballware webclient but not how applications are **modeled with metadata**: navigation, lists, edit forms (CRUD), custom functions, and statistics. The deliverable is a set of English Markdown files describing the **raw metadata JSON** (the envelope served by the Ballware metadata backend and parsed by `@ballware/rest-meta-api`), readable by humans and AI so metadata can be authored manually or via prompts. The README will link the new files.

Decisions confirmed with the user:
1. **Structure**: `docs/metadata/` folder — index file + one file per modeling topic, linked from `README.md`.
2. **Canonical format**: document the **exact backend envelope** (PascalCase fields; layout payloads as embedded JSON strings, parsed via JSON5) with all examples in **strict plain JSON**, plus a note that JSON5 is tolerated.
3. **Depth**: **complete self-contained reference** — every registered item type with option tables, all `CustomScripts` hook signatures, `ScriptUtil` contract, and a "caveats" section for options declared in code but unused.

All facts below were verified against source during planning. The implementer must re-verify option tables against the cited files while writing.

## Facts verified against source (source map)

Raw envelope interfaces (`libs/rest-meta-api/src/lib/`):
- `entity.ts` `EntityMetadata`: `Application`, `Entity`, `DisplayName`, `BaseUrl`, `ItemMappingScript`, `ItemReverseMappingScript`, `Lookups`, `Picklists`, `Templates`, optional `CustomScripts`, optional `CustomFunctions`, `GridLayout`, `EditLayout`, `StateColumn`, `KeyColumn`. Payload fields are JSON5 strings parsed into the compiled model (`GridLayout`→`Array<GridLayout>`, `EditLayout`→`Array<EditLayout>`, `Templates`→`[{identifier, definition(string)}]` with nested JSON5 `definition`). `EntityCustomScripts` keys: `commonUtils`, `extendedRightsCheck`, `rightsParamForHead/ForItem`, `prepareCustomParam`, `prepareGridLayout`, `prepareEditLayout`, `prepareMaterializedEditItem`, `editorPreparing/Initialized/ValueChanged/Entered/Event/Validating`, `interactionKeyboardLine`, `detailGridCellPreparing`, `detailGridRowValidating`, `initNewDetailItem`, `prepareCustomFunction`, `evaluateCustomFunction`.
- `page.ts` `PageData`: `Identifier`, `Name`, optional `Layout` (JSON5 `PageLayout`), `Lookups`, `Picklists`, `CustomScripts` (`prepareCustomParam`, `paramsInitialized`, `paramEditorInitialized/ValueChanged/Event`). Fixtures add an `Id` row id.
- `tenant.ts` `Tenant`: `Id`, `Name`, optional `Navigation` (JSON5 `NavigationLayout`), `Templates`, `RightsCheckScript` (function body returning `hasRight(userinfo, right)`).
- `statistic.ts` `Statistic`: `Id`, `Entity`, `Identifier`, `Name`, `Layout` (JSON5 `StatisticLayout`), optional `MappingScript`, `CustomScripts` (`argumentAxisCustomizeText`).
- Metadata endpoints: `{meta}/entity/metadataforentity/{entity}`, `{meta}/page/pagedataforidentifier/{page}`, `{meta}/tenant/metadatafortenant/{tenant}`, `{meta}/statistic/metadataforidentifier/{identifier}`; select-list/by-id variants exist per resource.

Compiled model (`libs/meta-model/src/lib/`): `entity.ts` (`CompiledEntityMetadata`, `GridLayout`, `GridLayoutColumn`, `EditLayout`, `EditLayoutItem`, `EditLayoutItemOptions`, `DetailLayout`, `EntityCustomFunction`, `CompiledEntityCustomScripts`), `page.ts` (`PageLayout`, `PageLayoutItem`, `PageToolbarItem`, option interfaces), `statistic.ts` (`StatisticLayout`, chart/map/pivot options), `tenant.ts` (`NavigationLayout`, `NavigationLayoutItem`), `template.ts`, `rights.ts`, `scriptutil.ts` (ScriptUtil contract), `customparam.ts`, `cruditem.ts`.

Registered renderer types (`libs/dx-renderer/src/lib/components/index.ts`):
- Edit items: `button`, `staticbuttongroup`, `text`, `mail`, `textarea`, `richtext`, `number`, `bool`, `toggle`, `date`, `datetime`, `lookup`, `staticlookup`, `pickvalue`, `multilookup`, `staticmultilookup`, `multivalue`, `tabs`, `group`, `map`, `entitygrid`, `detailgrid`, `detailtree`, `json`, `javascript`, `sql`, `attachments` (+ typo alias `attachements`), `statistic`.
- Grid columns (entity and detail): `bool`, `number`, `date`, `datetime`, `lookup`, `pickvalue`, `staticlookup`, `multilookup`, `staticmultilookup`, `string`, `text`, `popup`, `button`, `dynamic`.
- Toolbar items: `lookup`, `staticlookup`, `multilookup`, `staticmultilookup`, `number`, `text`, `bool`, `date`, `datetime`, `button`, `dropdownbutton`.
- Page items: `tabs`, `crudcontainer`, `grid`, `map`, `statistic` (`tab` only as child of `tabs`; `entitygrid` appears in the type union but is not registered — pages must use `grid`).

CRUD/query behavior (`libs/rest-meta-api/src/lib/genericentity.ts`, `libs/ngrx-meta-services/src/lib/crud/crud.store.ts`, `libs/dx-renderer/src/lib/datacontainer/**`):
- `BaseUrl` placeholders expanded: `{identity} {meta} {tenant} {generic} {document} {ml} {storage}` (fixture uses `"{generic}ballware/demoorder"`).
- Endpoints: `GET {baseUrl}/all?identifier={query}`, `GET {baseUrl}/query?identifier={query}&…`, `GET {baseUrl}/count?…`, `GET {baseUrl}/byId?identifier={id}&id=`, `GET {baseUrl}/new[query]?identifier=`, `POST {baseUrl}/save?identifier=` / `savebatch`, `DELETE {baseUrl}/remove/{id}`, `POST {baseUrl}/import` (multipart `files[]`), `POST {baseUrl}/exporturl` → `{Id,TenantId}` → `GET {baseUrl}/download/{TenantId}/{Id}`.
- Defaults: list query `itemoptions.query ?? 'primary'`; edit/view/add/save identifiers = edit layout identifier (`?? 'primary'`); import/export use custom function `id`.
- Rights strings: `<application>.<entity>.<functionId>` (e.g. `ballware.demoorder.edit`) and `generic.page.<page>` for navigation visibility.
- Grid: remote sorting/filtering disabled — client-side DevExtreme paging/filtering after full query result; `position` orders columns; modes small/medium/large via responsive service; excel export client-side (`exceljs`+`file-saver`).

Lookups (`libs/meta-services/src/lib/lookup.service.ts`, `libs/dx-renderer/src/lib/utils/lookupbuilder.ts`, `libs/rest-meta-api/src/lib/lookup.ts|pickvalue.ts|processingstate.ts`):
- Lookup metadata `{ identifier, id, valueMember, displayMember, type?, hasParam? }`; `type === 1` → autocomplete family, otherwise lookup family; `hasParam` selects `…withparam` variant; auto-created state lookups when `StateColumn` set.
- Picklist metadata `{ identifier, entity, field }` → pickvalue endpoints.
- Selection order for editors/columns: `items` → `itemsMember` → `lookupMember` (columns) → `lookup` (+`lookupParam`, or `pickvalueEntity`+`pickvalueField` for columns). `valueExpr`/`displayExpr` default to lookup `valueMember`/`displayMember` (fallback `Id`/`Name`).

Custom functions (`libs/meta-model/src/lib/entity.ts`, `libs/ngrx-meta-services/src/lib/meta/meta.store.ts`): types `add|edit|import|export|default_add|default_view|default_edit`; `default_*` replace built-ins (disable add via `default_add` with `id:'none'`); flow `prepareCustomFunction` → `execute(params)` dialog with `editLayout` → `evaluateCustomFunction` → `save`/`saveBatch(customFunction.id)`; `multi`, `supportContinue`, `externalEditor`, `options:{format:'xml'|'json'|'csv'}`.

Script compilation (`libs/meta-scripting/src/lib/**`): each hook script is a **function body** wrapped via `new Function(<named args>, body)`; `commonUtils` is prepended; args per hook are documented in `meta-model` types. Page `actions` object exposes `loadData(params)` (query-param merge `?page=<qs>`).

Templates (`libs/ngrx-meta-services/src/lib/meta/meta.store.ts`): edit item `{ type:'template', options:{ itemoptions:{ scope:'tenant'|'meta', identifier } } }` materialized from tenant/meta templates, then `prepareMaterializedEditItem` may mutate it.

Navigation (`libs/ngrx-meta-services/src/lib/tenant/tenant.reducer.ts`, `libs/dx-renderer/src/lib/page/defaultredirect/`): `NavigationLayout { title, defaultUrl?, items }`; items `type:'page'|'group'|'section'`, `options { page, url, caption, icon }`; page items require right `generic.page.<page>` and route to `/page/<url>`; `group` renders only if allowed children exist; `section` is transparent (children hoisted); `defaultUrl` drives wildcard redirect.

Statistics (`libs/dx-renderer/src/lib/components/statistic/**`, `libs/meta-services/src/lib/statistic.service.ts`): data from `{tenant}/statistic/dataforidentifier/{identifier}` + head params; layout `type:'chart'|'map'|'pivot'` with option trees from `meta-model/statistic.ts`; `mappingScript(data, layout, customParam, params, lookups, util, callback)` prepares data/layout; `argumentAxisCustomizeText` axis labels; embedded in pages via page item `statistic` (`itemoptions {statistic, params?}`) and in edit forms via edit item `statistic` (`itemoptions {identifier, statistic?, params?}`).

Fixture examples (use/extend as doc examples): `fixtures/e2e/tenant/e2e.json`, `fixtures/e2e/page/e2e-orderslist.json`, `fixtures/e2e/entity/demoorder.json`, `fixtures/e2e/identity/e2e-user.json` (rights strings). Storybook stories under `libs/dx-renderer/src/lib/components/**.stories.ts` hold realistic layout snippets.

Caveats to document explicitly (verified):
- `PageToolbarItem.defaultValue` is never read; initial values are set in `paramEditorInitialized` scripts.
- `GridLayoutColumn.hidingPriority` is reset/unused.
- `identifier` (page state / storageIdentifier) on grids is not bound to a state store — column state not persisted.
- `uniqueKey` on edit `entitygrid` itemoptions is unused; page `map` `displayMember`/`editLayout` unused by the page map component.
- `fieldset` component exists but is not registered.
- `attachements` is a registered typo alias of `attachments`.
- Edit `tabs` persists the selected tab **index** into the bound `dataMember`.
- `GridLayoutColumn` inherits edit-only options that some column types ignore.

## Deliverables

New files (all English; code fences ```json``` with **strict JSON** payloads; one note per file that the backend tolerates JSON5):

1. `docs/metadata/README.md` — index + overview
   - Metadata flow diagram: backend endpoints → rest-meta-api envelope → compile (`JSON5.parse` + script wrapping) → dx-renderer registries.
   - Envelope conventions: PascalCase fields; payloads as embedded JSON strings; example envelope shown once with escaped payload string, payloads then shown as standalone blocks.
   - Identifier conventions (`primary` defaults for query/edit layout/grid layout), rights string conventions (`<app>.<entity>.<function>`, `generic.page.<page>`).
   - How to author with AI prompts: checklist (which envelope, required fields, strict JSON, reference to topic files).
   - Links to all topic files.

2. `docs/metadata/navigation.md` — tenant metadata envelope, `NavigationLayout` schema and type/option table (`page|group|section`, `options {page,url,caption,icon}`), visibility/rights rules, `defaultUrl`, routing `/page/{url}`, full JSON example (extend `fixtures/e2e/tenant/e2e.json`).

3. `docs/metadata/entities-and-crud.md` — entity envelope field table (all `EntityMetadata` fields incl. optionality), `BaseUrl` placeholders, `KeyColumn`/`StateColumn`, CRUD endpoint contract (all patterns above), identifier defaults, head params (`additionalParamsToUrl` semantics: repeated array keys), item mapping scripts (`ItemMappingScript`/`ItemReverseMappingScript` bodies with `item, customParam, util`), state/pickvalue/lookup auto lookups, rights strings.

4. `docs/metadata/lists.md` — `GridLayout` schema (`identifier,title,editLayout,allowMultiselect,allowEditing,allowSearchByBarcode,columns,summaries,details`), `GridLayoutColumn` full option table + per-column-type tables (all 14 column types incl. `button`/`popup`/`dynamic` semantics, `precision`→format, `sorting`, `fixedPosition`, `editable`/`editFunction`/`popuplayout`), summaries, master/detail `details` expansion, client-side paging/filtering note, caveats.

5. `docs/metadata/edit-forms.md` — `EditLayout`/`EditLayoutItem`/`EditLayoutItemOptions` tables; lookup-family resolution order and expr defaults; `itemoptions` tables for every registered edit type (from components dir; verify while writing); `validations`; templates materialization (`scope`, `identifier`); runtime-settable options via `EditUtil.setEditorOption` (`required`, `acceptCustomValue`, `items`, `min`, `max`); detail collection editing `itemoptions {columns, add, update, delete, editMode 'row'|'instant', showSource}` and its script hooks; caveats.

6. `docs/metadata/custom-functions.md` — `EntityCustomFunction` schema and semantics table; default function replacement incl. `id:'none'`; add menu vs row option vs bulk (`multi`) grouping; import/export formats and endpoints; `prepareCustomFunction`/`evaluateCustomFunction` contract with example script bodies; `externalEditor`; foreign-entity functions (`entity` field).

7. `docs/metadata/statistics.md` — statistic envelope; `StatisticLayout` chart/map/pivot option tables (incl. series/pivot `format` enum, axis constant lines, tickInterval); `mappingScript` + `argumentAxisCustomizeText` contracts with examples; data endpoint and head-param flow; embedding in pages (`statistic` page item) and edit forms (`statistic` edit item); tab counters via `tab` `itemoptions {entity, query}`.

8. `docs/metadata/scripting.md` — `CustomScripts` object shape per resource; compilation mechanism (function body + `commonUtils` prefix); hook reference tables per resource (entity/page/statistic/tenant) with argument lists, invocation timing, and return semantics (from `meta-model` types); `ScriptUtil` method table (from `scriptutil.ts`); `prepareCustomParam` chain; page `actions.loadData`; lookup `type`/`hasParam` semantics.

9. `README.md` updates:
   - Add "Modeling Applications with Metadata" to the Table of Contents and a new section (after Architecture) with one-line summaries linking all `docs/metadata/*.md` files.
   - Mention `fixtures/e2e/` as runnable examples.

## Execution steps

1. Create `docs/metadata/`; write the 8 files. While writing each option table, re-open the cited source files and copy option names exactly (do not invent keys). Derive examples from `fixtures/e2e/*` extended to cover: navigation with groups, entity with custom functions + detailgrid, page with toolbar filters and statistics.
2. Every JSON example must be strict-JSON valid; payload strings inside a full envelope example must be properly escaped.
3. Update `README.md` (ToC + section + links). Keep README wording consistent with existing tone.
4. Verify links from README and between docs resolve relative to the repo root.

## Validation

- Extract fenced `json` blocks (or paste representative examples) and run `node -e 'JSON.parse(...)'` — every example must parse in strict mode; confirm JSON5 tolerance claim by noting adapter uses `JSON5.parse` (`rest-meta-api`).
- Cross-check every documented type name against `libs/dx-renderer/src/lib/components/index.ts` and every option name against the component sources.
- `git diff` review: only new `docs/metadata/*.md` and the README links change.
- No build/test commands required (docs-only change); `nx build` unaffected.

## Risks / open questions

- The metadata backend (`ballware.meta.service`) is external to this repo; docs describe the contract **as consumed by this client** — phrase accordingly.
- Lookup numeric `type` values other than `1` are implementation-specific in the backend; document only the verified `1` → autocomplete vs lookup-family behavior.
- Raw envelopes in fixtures include a redundant `Id` alongside `Identifier`; document `Id` as backend row id, `Identifier` as lookup key.
