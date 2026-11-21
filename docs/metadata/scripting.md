# Custom Scripts

Every behavior that is not expressible through layouts is implemented with **scripts stored in metadata**. A script string is the **body of a function** whose parameter names are fixed by the client. Script compilation lives in `libs/meta-scripting/src/lib/**`; the compiled functions are invoked by the stores in `libs/ngrx-meta-services/src/lib/**` and the components in `@ballware/dx-renderer`.

## Compilation model

- Each script string is wrapped with `Function.apply(Function, argNames.concat(code))` — equivalent to `new Function('a', 'b', 'return ...')` with the fixed argument names (e.g. `libs/meta-scripting/src/lib/entity/editorpreparing.ts:16-19`). Then the compiled function is invoked via `compiledFn.apply(compiledFn, [...args])`.
- **Parameter names are fixed.** A script must reference the exact names listed in the hook tables below; anything else is a global lookup and either resolves to `undefined` or throws.
- The body runs in the page's JavaScript context: there is **no module/import system**, and `this` inside a script is the wrapper function itself — do not rely on it. Use the `util` argument ([ScriptUtil](#scriptutil-util)) for platform capabilities.
- If a script is empty or omitted, a typed **default no-op** is compiled instead; the default per hook is listed in the tables.
- `commonUtils` (below) is prepended to entity-scoped scripts as `commonUtils + '\n' + customScript` (`libs/rest-meta-api/src/lib/entity.ts:67-68, 102-120`).

## Where scripts live in the envelope

| Envelope | Script location |
|---|---|
| Entity | Top-level `ItemMappingScript`, `ItemReverseMappingScript` (plain script strings) + `CustomScripts` (JSON string holding the key/value map below) |
| Page | `CustomScripts` (JSON string): `prepareCustomParam`, `paramsInitialized`, `paramEditorInitialized`, `paramEditorValueChanged`, `paramEditorEvent` (`libs/rest-meta-api/src/lib/page.ts:19-25`) |
| Statistic | Top-level `MappingScript` (plain script string) + `CustomScripts` (JSON string): `argumentAxisCustomizeText` (`libs/rest-meta-api/src/lib/statistic.ts:11-23`) |
| Tenant | Top-level `RightsCheckScript` (plain script string, compiled to the tenant `hasRight` function; `libs/rest-meta-api/src/lib/tenant.ts:15`) |

`CustomScripts` keys for the **entity** envelope (`libs/rest-meta-api/src/lib/entity.ts:28-49`): `commonUtils`, `extendedRightsCheck`, `rightsParamForHead`, `rightsParamForItem`, `prepareCustomParam`, `prepareGridLayout`, `prepareEditLayout`, `prepareMaterializedEditItem`, `editorPreparing`, `editorInitialized`, `editorValueChanged`, `editorEntered`, `editorEvent`, `editorValidating`, `interactionKeyboardLine`, `detailGridCellPreparing`, `detailGridRowValidating`, `initNewDetailItem`, `prepareCustomFunction`, `evaluateCustomFunction`.

## Hook reference

"commonUtils" marks hooks whose compiled body receives the `commonUtils` prefix. All others do **not**.

### Entity — data mapping and layout preparation

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `ItemMappingScript` / `ItemReverseMappingScript` | `item, customParam, util` | mapped item (compiled path receives a deep clone of `item`) | passthrough `item` |
| `prepareGridLayout` | `lookups, customParam, util, gridLayout` | grid layout | passthrough `gridLayout` |
| `prepareEditLayout` | `mode, lookups, customParam, util, editLayout` | edit layout | passthrough `editLayout` |
| `prepareMaterializedEditItem` | `mode, lookups, customParam, util, editLayout, scope, identifier, materializedItem` | edit layout item | passthrough `materializedItem` |
| `prepareCustomParam` | `lookups, util, initialCustomParam, callback` | — | `callback(initialCustomParam)`. A script **must** call `callback(...)` exactly once with the resulting custom param, which is then available in most other hooks (`customParam` argument) |

### Entity — edit form lifecycle

The `mode` argument is one of the `EditModes` strings `'VIEW'`, `'EDIT'`, `'CREATE'` (`libs/meta-services/src/lib/editmodes.ts`). The `identifier` argument is the `dataMember` of the affected editor. See [edit-forms.md](edit-forms.md) for where each hook fires.

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `editorPreparing` | `mode, item, layoutItem, identifier, lookups, util` | — | no-op |
| `editorInitialized` | `mode, item, editUtil, identifier, lookups, util` | — | no-op |
| `editorValueChanged` | `item, editUtil, identifier, value, lookups, util` | — | no-op |
| `editorEntered` | `mode, item, editUtil, identifier, lookups, util` | — | no-op |
| `editorEvent` | `item, editUtil, identifier, event, lookups, util` | — | no-op |
| `editorValidating` | `item, editUtil, identifier, value, validation, lookups, util` | `true` = valid | `return true` |
| `interactionKeyboardLine` | `item, editUtil, value, lookups, util` | — | no-op |

`editorValidating` is invoked for `options.validations` rules with `validation.identifier` = the rule (`libs/dx-renderer/src/lib/directives/validation.ts`).

### Entity — detail collections

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `detailGridCellPreparing` | `mode, item, detailItem, identifier, options, util` | — | no-op |
| `detailGridRowValidating` | `mode, item, detailItem, identifier, util` | error message string, or `undefined` = valid | `undefined` |
| `initNewDetailItem` | `dataMember, item, detailItem, util` | mutate `detailItem` | no-op |

### Entity — custom functions

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `prepareCustomFunction` | `identifier, lookups, util, executeCallback, messageCallback, params, selection` | — | `selection?.forEach(s => executeCallback(s))` (executes every selected row directly) |
| `evaluateCustomFunction` | `identifier, continueAfterSave, editUtil, lookups, util, param, executeCallback, messageCallback` | — | `executeCallback(param)` |

See [custom-functions.md](custom-functions.md) for the function flow these hooks participate in.

### Entity — rights

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `extendedRightsCheck` | `userinfo, application, entity, readOnly, right, param, result` | `true` = allowed | passthrough `result` (the claim-based default check) |
| `rightsParamForHead` | `customParam, headParams` | head params | passthrough — **deprecated**, logs `console.warn('Use of deprecated rightsParamForHead script')` |
| `rightsParamForItem` | `item, customParam, headParams` | item | passthrough — **deprecated**, logs `console.warn('Use of deprecated rightsParamForItem script')` |

### Tenant

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `RightsCheckScript` | `userinfo, right` | `true` = allowed | `return true` |

### Page

`actions` is `{ loadData(params) }` (`libs/meta-model/src/lib/page.ts:350-357`) — it merges params into the page query string and reloads the page layout items. `pageParam` is the current page param object; `name` is the toolbar item's `name`.

| Hook | Arguments (in order) | Default when omitted |
|---|---|---|
| `paramsInitialized` | `hidden, lookups, util, actions, pageParam` | no-op |
| `paramEditorInitialized` | `name, editUtil, lookups, util, actions, pageParam` | no-op |
| `paramEditorValueChanged` | `name, value, editUtil, lookups, util, actions, pageParam` | no-op |
| `paramEditorEvent` | `name, event, editUtil, lookups, util, actions, pageParam, param` | no-op |

`param` (only for `paramEditorEvent`) is the event payload: a `dropdownbutton` menu click passes the clicked item's `id`, a split-button click passes `undefined` (`libs/dx-renderer/src/lib/components/dropdownbutton/toolbaritem.ts:41-54`, invoked at `libs/ngrx-meta-services/src/lib/page/page.store.ts:278-286`); filter-button patterns branch on it. The page `editUtil` maps `getEditorOption`/`setEditorOption` to the toolbar widget options **by item name** (`page.store.ts:58-61`) — option names are raw DevExtreme widget options, bypassing the edit-item option registry.

`paramsInitialized` fires only after every declared toolbar item has registered; a page with toolbar items renders only after `actions.loadData()` is called.

### Statistic

| Hook | Arguments (in order) | Return contract | Default when omitted |
|---|---|---|---|
| `MappingScript` | `data, layout, customParam, params, lookups, util, callback` | must call `callback(layout, data)` | `callback(layout, data)` |
| `argumentAxisCustomizeText` | `layout, value, params, customParam, util` | label string or `undefined` | `undefined` (raw value shown) |

See [statistics.md](statistics.md).

## commonUtils

`CustomScripts.commonUtils` is a script string prepended verbatim to **entity** scripts — both mapping scripts and all `CustomScripts` hooks **except `prepareCustomParam`**. Helper functions declared once here are available in every other entity hook. It is **not** available for `prepareCustomParam` (entity or page), the four page hooks, the statistic hooks, or the tenant script — those must be self-contained.

In practice production metadata **barely uses** `commonUtils` — helpers are usually inlined per hook. Both styles are valid; reach for `commonUtils` only when the same helper is needed in several hooks.

## Lookups in scripts

The `lookups` argument is a map of compiled lookup **descriptors** — and for parameterized lookups also **creators**: entries with `hasParam: true` (and the built-in `allowedStateLookup`/`allowedMetaStateLookup` and entity-scoped creators, see [entities-and-crud.md](entities-and-crud.md)) compile to a **function** `(param) => LookupDescriptor` (`LookupCreator`, `libs/ngrx-meta-services/src/lib/lookup/lookup.store.ts:304-324` lookup variant, `:356-367` autocomplete variant, `:385-424` allowed-state variants — the state creators accept a single id or an **array of ids**).

Call them inside scripts to fetch a scoped list:

```json
{
  "prepareCustomParam": "util.withLookupList(lookups.allowedStateLookup(['new','open']), (states) => callback({ states: states }));",
  "editorInitialized": "if (identifier == 'personId') { util.withLookupList(lookups.unitPersonalLookup(item.unitId), (persons) => editUtil.setEditorOption('personId', 'items', persons)); }"
}
```

Equivalent helpers that call the creator for you: `util.withLookupListParam(lookup, param, cb)` / `util.withLookupByIdParam(lookup, param, id, cb)` (`libs/ngrx-meta-services/src/lib/implementation/createscriptutil.ts:106-129`). The direct-call style additionally works with `withLookupList`/`withLookupById`/`withAutocompleteList` because those accept a finished **descriptor** — which is what `lookups.<id>(param)` returns.

## EditUtil

`editUtil` (editor hooks) is `EditUtil` (`libs/meta-model/src/lib/entity.ts:11-43`):

| Member | Description |
|---|---|
| `getEditorOption(dataMember, option)` | Read an editor option |
| `setEditorOption(dataMember, option, value)` | Set an editor option |
| `apply(editUtil, item, continueAfterSave)` | Execute the save of the current edit session |
| `cancel()` | Cancel the edit session |

Recognized option identifiers for editors are `value`, `visible`, `readonly`, `required`, `acceptCustomValue`, `items`, `min`, `max`; anything else throws `Unsupported option <...>` (see [edit-forms.md](edit-forms.md)).

## ScriptUtil (`util`)

The `util` argument is `ScriptUtil` (`libs/meta-model/src/lib/scriptutil.ts`):

| Member | Description |
|---|---|
| `uuid()` | New UUID |
| `token()` | Current user access token (async) |
| `user()` | Current user claims (async) |
| `parse(json)` / `stringify(obj)` | JSON (de)serialization |
| `dateToLocalDate(date)` / `localDateToDate(date)` | UTC ↔ local conversion |
| `beginOfYear()` / `endOfYear()` / `beginOfLastYear()` / `endOfLastYear()` | Date anchors |
| `withLookupList(lookup, cb)` | Fetch a lookup select list |
| `withLookupById(lookup, id, cb)` | Fetch a lookup element by id |
| `withLookupListParam(lookup, param, cb)` | Parameterized lookup list |
| `withLookupByIdParam(lookup, param, id, cb)` | Parameterized lookup element |
| `withPickvalueList(lookup, entity, field, cb)` | Pickvalues for entity field |
| `withPickvalueByValue(lookup, entity, field, value, cb)` | Single pickvalue |
| `withAutocompleteList(autocomplete, cb)` | Autocomplete list |
| `getJson(url, success, failure)` / `getText(url, success, failure)` | HTTP fetch helpers |
| `geocodeAddress(address, cb)` / `geocodeLocation(location, cb)` | Geocoding |
| `openDocumentDesigner(documentId, cb)` | Open document designer |
| `triggerSubscriptions(ids, cb, error)` | Trigger subscriptions for ids |
| `updateDatasources(ids, cb, error)` | Trigger datasource updates |
| `train(ids, cb, error)` | Train machine learning model |
| `speak(text)` | Text-to-speech output (e.g. scanner confirmations) — **implementation-provided**: present on the `util` instance (`libs/ngrx-meta-services/src/lib/implementation/createscriptutil.ts:175`) but not declared on the `ScriptUtil` interface |

## Examples

Entity `CustomScripts` payload (unescaped view; embed as an escaped JSON string in the envelope). Helpers from `commonUtils` are reusable in all entity hooks except `prepareCustomParam`:

```json
{
  "commonUtils": "function isClosed(item) { return item.Status == 'closed'; }",
  "editorInitialized": "if (mode == 'EDIT' && isClosed(item)) { editUtil.setEditorOption('OrderNr', 'readonly', true); }",
  "editorValueChanged": "if (identifier == 'Status' && value == 'closed') { editUtil.setEditorOption('Notes', 'required', true); }",
  "editorValidating": "if (validation.identifier == 'orderNrRequired') { return !!item.OrderNr; } return true;",
  "extendedRightsCheck": "if (right == 'edit' && isClosed(item)) { return false; } return result;"
}
```

Page `CustomScripts` payload (from `fixtures/e2e/page/e2e-orderslist.json`):

```json
{
  "paramsInitialized": "actions.loadData();",
  "paramEditorValueChanged": "if (name == 'statusfilter') { actions.loadData({ ...pageParam, statusfilter: value }); }"
}
```

## Practical recipes

Patterns commonly used in entity metadata. Use only option keys the client actually reads — [edit-forms.md](edit-forms.md) lists declared-but-never-read keys (e.g. `uniqueKey`/`fetchParams` on `entitygrid` `itemoptions`); setting them in a script has no effect.

### Seed defaults for new detail rows (`initNewDetailItem`)

`initNewDetailItem` fires when a detail grid inserts a row (`dataMember, item, detailItem, util` — see the hook table). Branch on `dataMember`, seed a fresh id with `util.uuid()`, copy parent references, and default flags/values:

```json
{
  "initNewDetailItem": "if (dataMember == 'Positions') { detailItem.Id = util.uuid(); detailItem.OrderNr = item.OrderNr; detailItem.Qty = 1; detailItem.Billed = false; }"
}
```

### Retarget an embedded `entitygrid` per editor (`editorPreparing`)

In `editorPreparing`, the `layoutItem` argument is the editor's `options` object (`libs/ngrx-meta-services/src/lib/meta/meta.store.ts:497-500`), so replacing `layoutItem.itemoptions` rewrites the configuration of one specific editor before rendering. Assign only the keys `entitygrid` reads (`query`, `layout`, `headParams`, `customParam`, `readOnly` — see [edit-forms.md](edit-forms.md)); `identifier` is the editor's `dataMember`, which doubles as the entity identifier on `entitygrid`:

```json
{
  "editorPreparing": "if (identifier == 'demoorder') { layoutItem.itemoptions = { query: 'byCustomer', layout: 'primary', customParam: { customerId: item.Id }, readOnly: mode == 'VIEW' }; }"
}
```

### Chain lookups before the first data load (`prepareCustomParam` / `paramsInitialized`)

Async lookup helpers nest — collect several lists, then trigger the load/callback once all are present:

```json
{
  "paramsInitialized": "util.withPickvalueList(lookups.entityPickvalueLookup, 'demoorder', 'category', (categories) => { util.withLookupListParam(lookups.entityStateLookup, 'demoorder', (states) => { actions.loadData({ categories: categories.map((c) => c.Value), states: states.map((s) => s.State) }); }); });"
}
```

```json
{
  "prepareCustomParam": "util.withLookupList(lookups.groupsLookup, (groups) => { util.withLookupList(lookups.itemsLookup, (items) => { callback({ groups: groups, items: items }); }); });"
}
```

### Cascade dependent editors and gate on lookup row attributes (`editorValueChanged`)

Refine one editor from another's value — a scoped list for the dependent editor, or required/readonly flags driven by attributes on the selected lookup row (state rows carry `ReasonRequired`, `Finished` — see [entities-and-crud.md](entities-and-crud.md)):

```json
{
  "editorValueChanged": "if (identifier == 'unitId') { util.withLookupList(lookups.personalForUnitLookup(value), (persons) => { editUtil.setEditorOption('personId', 'items', persons); }); } else { editUtil.setEditorOption('personId', 'items', []); }"
}
```

```json
{
  "editorValueChanged": "if (identifier == 'Status') { util.withLookupById(lookups.stateLookup, value, (state) => { editUtil.setEditorOption('StatusReason', 'readonly', !state.ReasonRequired); editUtil.setEditorOption('StatusReason', 'required', !!state.ReasonRequired); }); }"
}
```

### Seed a lookup editor's `items` from row references (`editorInitialized`)

Restrict a select list to the options relevant for the edited item (e.g. a default reference narrowed by stored associations):

```json
{
  "editorInitialized": "if (identifier == 'defaultSupplierId') { util.withLookupList(lookups.supplierLookup, (suppliers) => { const ds = (item.supplierAssociations || []).map((a) => suppliers.find((s) => s.Id == a.supplierId)).filter((s) => s); editUtil.setEditorOption('defaultSupplierId', 'items', ds); }); }"
}
```

### Switch cell editors per detail row (`detailGridCellPreparing`)

On `dynamic` columns (see [lists.md](lists.md)), rewrite the cell editor per row — `identifier` is the **column's** data member, `options` is a clone of the column whose mutations take effect. Type by a row attribute, or a parameterized autocomplete per row:

```json
{
  "detailGridCellPreparing": "if (identifier == 'checkValue') { switch (detailItem.type) { case 0: options.type = 'bool'; break; case 1: options.type = 'number'; break; case 2: options.type = 'date'; break; case 3: options.type = 'datetime'; break; default: options.type = 'string'; } } if (identifier == 'size') { options.type = 'lookup'; options.lookup = 'sizeAutocomplete'; options.lookupParam = detailItem.itemId; options.acceptCustomValue = detailItem.customSizeAllowed; }"
}
```

Note `options.type = 'string'` — the dynamic cell renderer renders `string`, **not** `text` (see [lists.md](lists.md)).

### Reject invalid detail rows with a message (`detailGridRowValidating`)

Returning a **string** fails the row and shows it as the validation message; `undefined` accepts it:

```json
{
  "detailGridRowValidating": "if (identifier == 'items' && !detailItem.unitId) { return 'A unit must be selected'; } return undefined;"
}
```

## Caveats (verified against source)

- Argument names are **fixed per hook** — the tables above are the only valid identifiers; a wrong name silently becomes a global lookup.
- A script must call its `callback`/`executeCallback` — omitting the call suppresses the result (`prepareCustomParam`, `MappingScript`, custom function hooks).
- `rightsParamForHead` / `rightsParamForItem` are deprecated (compile-time `console.warn`, `libs/meta-scripting/src/lib/entity/rightsparamforhead.ts:13`, `rightsparamforitem.ts:13`) and only pass their input through by default.
- `ItemMappingScript` and `ItemReverseMappingScript` are **top-level envelope fields**, not `CustomScripts` keys.
- `mode` strings are uppercase (`'VIEW'`, `'EDIT'`, `'CREATE'`) — comparisons are case-sensitive.
- `prepareCustomFunction`/`evaluateCustomFunction` defaults execute the selected rows immediately — provide a script when a function needs confirmation or a custom flow (see [custom-functions.md](custom-functions.md)).
