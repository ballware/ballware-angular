# Extend metadata docs with findings from the productive fwpro tenant export

## Goal

Enrich `docs/metadata/` with best practices and concrete (anonymized) patterns extracted from the productive tenant export at `~/Documents/GitHub/ballware-fwpro/` (~260 metadata records: 42 entities, 48 pages, 71 lookups, 10 statistics, 10 documentations, documents/notifications/subscriptions/mlmodels, 1 tenant, 1 identity).

Hard constraints:
- **No tenant data in the docs.** Examples are rewritten generically (entities like `task`, `workorder`, `asset`, `person`, `unit`; German captions only where i18n context is shown). Cite fwpro files only as evidence pointers in this plan, never inside the docs.
- Backend-only metadata (ListQuery/ByIdQuery/SaveScript/States/Rights/ServerScriptDefinitions/ReportBinary/TrainSql/__KEY__ …) is **not** documented as client contract; at most one short "backend-side context" note in README.
- Doc examples stay strict JSON. Keep the established format: tables + "Caveats (verified against source)" + source file references.
- Only edit markdown under `docs/metadata/`. No code changes.

## New file: `docs/metadata/pages.md` (page envelopes)

The page envelope (`GET {meta}/page/pagedataforidentifier/{id}`, compiled `CompiledPageData`, `libs/meta-model/src/lib/page.ts`, renderer `libs/dx-renderer/src/lib/page/**`, toolbar `libs/dx-renderer/src/lib/toolbar/**`) has no dedicated doc file today. Evidence: `page/myPage.json`, `page/reportPage.json`, `page/reportStatOverviewPage.json`, `page/requirementPage.json`.

Sections:
1. **Envelope**: `Id`, `Identifier`, `Name`, `Layout` (JSON string), `Lookups`, `Picklists` (page-scoped lookup registration via `page.store.ts:126-133,160`), `CustomScripts` (the 5 hooks, see scripting.md fix below).
2. **Layout root**: `title`; `documentationEntity` → drives the header help button (`page.store.ts:84-87`, `application/header/header.component.*`, `application/documentation/documentation.component.*`) which shows the matching **documentation metadata** record (`{ Entity, Field, Content }`, Content = HTML incl. embedded images, managed via meta documentationPage / `documentationLookup`); add a short "Documentation metadata" subsection here.
3. **`toolbaritems`** (param editors): observed types `datetime`, `number`, `lookup`, `multilookup`, `button`, `dropdownbutton` (with `options.items: [{id,text}]`); `name` becomes the head-param key; lookup references may sit at item root (`lookup: '<identifier>'` incl. built-ins like `stateLookup`); toolbar params feed grid queries, tab counters and statistic data calls via `actions.loadData(...)` merge.
4. **Page item tree**: `tabs` (`itemoptions.identifier` = TabsOptions state identifier), `tab` (`itemoptions.caption` + optional `entity`/`query` → **tab counter badge**: `count(query ?? 'primary', headParams)` via `components/tabs/page/counter.component.ts:65-86`; 401 → tab removed (`tabNotAuthorized`)); production convention: data query `myopen` paired with counter query `myopencount`.
5. **`crudcontainer`** (`itemoptions.entity`, `query`) + child **`grid`** (`itemoptions.layout`, `height`, `identifier`); **`statistic`** items (`itemoptions.statistic` + `itemoptions.height`, e.g. `calc(100vh - 200px)`); occasional `entitygrid`, `map`, `multilookup`, `lookup`, `button` items (inventory counts from the scan, keep to what `components/index.ts` registers).
6. **Head params flow**: toolbar → `actions.loadData` → query string → grid `query`, tab `count`, statistic data endpoint, and `MappingScript` `params` (see statistics.md).
7. Caveats: `GridLayout.searchparams` exists in production metadata but is **never read** by the client (no reference in `libs/`); filters must use page `toolbaritems`.

## `navigation.md` additions

- Production `RightsCheckScript` pattern: `switch (right)` mapping `generic.page.<page>` visibility onto entity rights (`incidentreport.report.view`), meta-admin pages onto `meta.<x>.view`, identity pages onto `identity.user.view`; **scoped rights families** resolved with `startsWith` (e.g. `incidentreport.ownrequirement.view.<UnitId>`).
- `userinfo` is the raw identity-provider claims record: production tenant uses claims `right` (lowercase array) and custom claims (e.g. `person`); the e2e fixture uses `Rights`. Correct both docs examples and state that claim naming is backend-dependent.
- Tenant `Templates` in practice: one tenant template `activitytab` (tab item containing an `entitygrid` with `query: 'context'`) referenced by several entities via `type: "template"` + `scope: "tenant"`.

## `entities-and-crud.md` additions

- **Standalone lookups**: entity `Lookups` entries reference lookup metadata records (`lookup/…json`) via `id` (uuid) + `identifier` + `valueMember`/`displayMember`/`type`/`hasParam`; lookup records carry `Type: 1` (autocomplete) and `HasParam` (param-lookup) — client contract unchanged, add authoring note (managed via lookupPage / `lookupLookup`).
- **Param lookups as callable creators**: `hasParam: true` compiles to `LookupCreator` (`lookup.store.ts:301-319`, autocomplete variant `:357-365`); in scripts use `lookups.<id>(param)` inside `util.withLookupList/withLookupById/withAutocompleteList` — production shapes: `lookups.allowedStateLookup(ids[])`, `lookups.unitOperationPersonalLookup(unitId)`, `lookups.sizeAutocomplete(equipmentId)`, `lookups.criteriaForReportLookup(reportId)`.
- **State attributes** available on `stateLookup` items and used in scripts: `State`, `Name`, `Finished`, `ReasonRequired` (status-reason gating recipe).
- **Rights depth**: parameterized row-scoped rights (`<app>.<entity>.<function>.<UnitId|PersonId>`), category-derived rights (`<app>.<entity>.<ConfidentialCategory>.<right>`), remapping inside `extendedRightsCheck` (`right = 'edit'`), and `rightsParamForItem` producing a slim param object consumed as `param` in `extendedRightsCheck` (still pervasive in production despite the deprecation warning — keep "deprecated" label, add "production usage" note).
- **Print/documents**: print button appears only when the entity has ≥1 document (`meta.store.ts:389-390` `printAllowed$` uses `entityDocuments$`); print action routes `/print?docId=<documentId>&id=<key values>` (`crud.store.ts:343-352`). Keep to one paragraph + `documentLookup`/`openDocumentDesigner` cross-refs; documents themselves (designer artifacts, notifications/subscriptions, mlmodel training) are backend-side — mention only as a one-paragraph "backend-side context" (or in README, see below).
- **Custom function type `external`**: present in production CustomFunctions (e.g. stock re-listing location/person/vehicle functions), **not** part of the client union `EntityCustomFunction['type']` (`meta-model/src/lib/entity.ts:411`); client has no special handling (head-level rights check + normal custom pipeline). Document as backend aggregation artifact; recommend not authoring it from the client contract side.
- Backend-side envelope fields to list once as ignored context (one short table): `ListQuery`, `ByIdQuery`, `NewQuery`, `SaveScript/SaveStatement`, `RemoveScript/…`, `BeforeSaveScript`, `ListScript`, `ByIdScript`, `StateAllowedScript`, `ScalarValueQuery`, `States`, `Rights`, `StateReasonColumn`, `Indices`, `GeneratedSchema`, `NoIdentity`, `ProviderModelDefinition`, `Meta`, `__KEY__`.

## `lists.md` additions

- Inline-edit trigger recipe: `editable: true` + `editFunction: '<customFunctionId>'` on a state column → opens the batch state-change function instead of cell editing (production `report` grid Status column).
- **Dynamic grid columns recipe** (major best practice, cross-link scripting.md): `prepareCustomParam` loads a columns lookup (`dynamicColumnsLookup`) → `prepareGridLayout` pushes value columns (`dataMember: 'characteristicvalues.<id>'`) + matching `summaries` → `ItemMappingScript` populates `item.characteristicvalues` from the flattened server row. Production: `entity/report.json`.
- Master-detail example: `details` containing `tabs` with `statistic` (edit-embed keys `identifier`/`params`), `entitygrid` (`query: 'report'`), `attachements` (`dataMember: 'Id'`).
- Production conventions corroborating existing docs: px widths, `fixedPosition: 'left'`, `position`, `sorting`, `precision`, `allowMultiselect`/`allowEditing`, summaries `count`/`sum` with `groupSummary`.
- Caveat: production grid `searchparams` key is ignored by the client (see pages.md); `hidingPriority` explicitly stored as `null` — client clears it anyway.

## `edit-forms.md` additions

- Registered silent item type **`empty`** (spacer/collapsed group): `layout/edit/item.component.ts:43` treats it as known; production sets `type: 'empty'` at runtime from `prepareEditLayout` when a group has no items.
- **Address/coordinate pattern** (production `report` edit form): `map` editor `Location` + hidden `Location.lat`/`Location.lng` number editors kept in sync via `editorValueChanged`, plus `util.geocodeAddress` round-trip from a free-text address editor; `ItemMappingScript`/`ItemReverseMappingScript` convert between `Latitude`/`Longitude` and `Location.{lat,lng}`. Note: dotted `dataMember` paths are ordinary property paths on the item (editor lifecycle registers exact `dataMember` strings, `renderer-commons/src/lib/directives/edititemlifecycle.ts`).
- **Runtime layout rewriting** recipes with production shapes: swap item type per mode (`entitygrid` → `multilookup` with lookup in CREATE), inject `staticmultilookup` items per lookup-driven group (`itemsMember: '<member>.<id>'` — resolved from the edited item; verify the item supplies the list in implementation phase), retarget `entitygrid` (`headParams`, `customParam`, `readOnly` from row lock; production also sets `uniqueKey`/`fetchParams` — confirmed still unread by `editentitydatagrid.component.ts`, keep existing caveat).
- **Templates in production**: entity-scoped templates (`initialstock`, `bookingtarget`, `bookingsource`, `enquirer`, `order`, `delivery`) + tenant template (`activitytab`), combined with `prepareMaterializedEditItem` (9 entities).
- **Barcode/scanner workflow** (production `checkup`): grid `allowSearchByBarcode` + add-function with scan icon/`supportContinue` + dedicated `editLayout: 'addscan'` + `interactionKeyboardLine` reacting to sentinel values (`**PASSED**` …) + `util.speak()` confirmation.

## `custom-functions.md` additions

Genericized function catalog observed in production (illustrates the full spectrum): renamed defaults (`default_add`/`default_edit` with custom ids on a stock-like entity), state-change batch function (`state`), order/delivery workflow steps gated by `allowedStateLookup` + `messageCallback` refusal, quantity-adjustment functions, cross-entity derivation (checklist association → virtual requirement item via `withLookupById` of an association lookup), virtual form backed by a `detailgrid` (`items` detail member) with `supportContinue` + `editUtil.setEditorOption('items','items',…)` reset, scanner add, barcode-limited add, import/export (`options.format: "json"|"csv"`) on master data.

Recipes:
- **Batch state-change** end-to-end: `prepareCustomFunction` (allowed states + `{states, items}` payload) → `editLayout` with virtual `NewStateId` lookup seeded in `editorEntered` from `item.states` + reason field gated by `ReasonRequired` → `evaluateCustomFunction` maps selection to an **array** → `POST /save?identifier=<functionId>` per-item semantics handled server-side; client persists via `saveBatch` when array.
- Caveat: production passes a **2nd argument to `executeCallback`** (dialog title) — the client ignores it (`crud.store.ts:385-389` uses `customFunction.text` as title). Document explicitly.
- Caveat: virtual items are saved through the **entity's own save endpoint with the function id as identifier**; the server decides what is created (cross-entity derivation depends on backend mapping — state this).

## `statistics.md` additions

- `series[].type` is passed through to DevExtreme, not restricted to `bar|line` — production uses `stackedarea`; MappingScript can **build `series` dynamically** (including `layout.title` and axis `lines` from lookup data, `labelText`, `dashStyle`).
- Data flow into `MappingScript`: page toolbar head params arrive as `params`, page/entity `prepareCustomParam` as `customParam`; production example: year range filter → `from`/`to`/`units` → statistic data + `params.scale` from edit-form embedding (`itemoptions.params`, mutated in `editorPreparing` with `layoutItem.itemoptions.params.reportId = item.Id`).
- Map data shape recipe: MappingScript builds `{ location: { lat, lng }, tooltip: { text, isShown } }` rows for `locationField`/`tooltipField`.
- Pivot production example: per-field `showTotals`/`showGrandTotals`/`expanded` work; top-level `options.showTotals`/`showGrandTotals` in production layouts are **not read** (client reads `showRowTotals`/`showRowGrandTotals`, `pivotgrid.component.ts`, `chart`/`pivotgrid` templates) → caveat.
- Caveat: production typo `tickIntervall` (model key is `tickInterval`) shows unknown layout keys are silently ignored.
- Page embedding also honors `itemoptions.height` (production `calc(100vh - 200px)`).

## `scripting.md` additions

- Add **`util.speak(text)`** to the ScriptUtil table (implemented in `ngrx-meta-services/src/lib/implementation/createscriptutil.ts:175`, interface `scriptutil.ts` lacks it — mark as implementation-provided).
- New section **"Lookups in scripts"**: `hasParam` lookups are callable (`lookups.<id>(param)`); examples for lookup/autocomplete/`allowedStateLookup(ids)`; contrast with `withLookupListParam` helper.
- Page hook table fix: `paramEditorEvent` has an 8th argument **`param`** (event payload, e.g. selected `dropdownbutton` item id) after `pageParam` (`meta-model/src/lib/page.ts:76-85`). Production filter-button pattern relies on it.
- Production hook examples (anonymized): `prepareCustomParam` chaining multiple `withLookupList` calls before `callback`; `editorValueChanged` cascades (dependent lookup lists, required/readonly/acceptCustomValue toggling from lookup row attributes); `editorInitialized` seeding lookup `items` from row references; `detailGridCellPreparing` switching `options.type`/`lookup`/`lookupParam` per detail row; `detailGridRowValidating` returning an error string; `extendedRightsCheck` + `rightsParamForItem` slim param.
- Note: `commonUtils` barely used in production (1 entity); helpers are typically inlined per hook — mention both styles.

## README.md updates

- Contents table: add `pages.md`.
- Envelope conventions: state that production payload strings are JSON5-style (unquoted keys, single quotes, trailing commas) while strict JSON remains the recommended authoring form; mention `__KEY__` as export/storage artifact ignored by the client.
- Rights conventions: production scope families (`<app>.<entity>.<function>.<scope>`, `meta.*`, `identity.*`, `ai.*`) and claims naming caveat (`right` vs `Rights`).
- Optional short "Backend-side metadata (context)" subsection consolidating the ignored-fields list + one line each for documents/notifications/subscriptions/mlmodels (delivery & training backends reached from the client only via lookup/admin pages/util calls).

## Corrections checklist (verified against client source)

| Claim | Evidence | Action |
|---|---|---|
| `paramEditorEvent` missing `param` arg | `meta-model/src/lib/page.ts:76-85` | fix scripting.md table |
| `util.speak` undocumented | `createscriptutil.ts:175` | add to ScriptUtil |
| grid `searchparams` not read | no match in `libs/` | caveat in lists.md/pages.md |
| `executeCallback` 2nd arg ignored | `crud.store.ts:385-389` | caveat in custom-functions.md |
| pivot top-level `showTotals` not read | `pivotgrid.component.ts:54-55` (field-level only), html `showRowTotals` | caveat in statistics.md |
| `empty` is a valid item type | `layout/edit/item.component.ts:43` | add to edit-forms.md |
| `uniqueKey`/`fetchParams` still unread despite production usage | `editentitydatagrid.component.ts` (reads only query/layout/headParams/customParam/readOnly) | keep caveat, add production note |
| `external` function type not in union | `meta-model/src/lib/entity.ts:411` | caveat in custom-functions.md |
| tab counter + 401-hide behavior | `tabs/page/counter.component.ts` | new in pages.md |

## Out of scope

- No new backend contract docs (queries, save scripts, states storage, document designer format, subscription e-mail scheduling, mlmodel training internals, `generic/` datasource folders, identity provider setup).
- No changes to `libs/`, fixtures, or non-docs files.
- No tenant-specific business content in examples.

## Validation

1. Docs-only change: run repo lint/format for markdown if configured (`npx prettier --check docs/metadata` / existing lint script) and ensure all referenced source paths exist (`grep` for cited `libs/...` paths).
2. Cross-check every new claim against the cited client source files; every new example payload must parse as strict JSON (`JSON.parse`).
3. Spot-check the anonymized examples against `fixtures/e2e/` conventions (demoorder naming style) so copy-pasted snippets remain runnable.
4. Manual read-through of the README table + new `pages.md` for consistent terminology (envelope/PascalCase/caveats format).
