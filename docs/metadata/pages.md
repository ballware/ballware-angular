# Pages (Page Envelope)

Pages define the **screens** of an application: the navigation entry points referenced by the tenant navigation (`generic.page.<page>` rights, see [navigation.md](navigation.md)). Each page holds a layout tree (tabs, CRUD containers, grids, maps, statistics), a toolbar of **head-param editors**, page-scoped lookup registrations, and its own custom scripts.

Model source: `libs/meta-model/src/lib/page.ts` (`CompiledPageData`, `PageLayout`, `PageLayoutItem`, `PageToolbarItem`). REST adapter: `libs/rest-meta-api/src/lib/page.ts`. Store: `libs/ngrx-meta-services/src/lib/page/page.store.ts`. Renderer: page items in `libs/dx-renderer/src/lib/components/**` (registry `provideDefaultPageItems`, `components/index.ts:62-74`), toolbar in `libs/dx-renderer/src/lib/toolbar/**`.

## Envelope

Endpoint: `GET {meta}/page/pagedataforidentifier/{identifier}` (tooling variants: `page/selectlist`, `page/selectbyid/{id}` — `libs/rest-meta-api/src/lib/page.ts:47-71`).

Raw envelope (`PageData`, `libs/rest-meta-api/src/lib/page.ts:11-18`):

| Field | Type | Required | Description |
|---|---|---|---|
| `Identifier` | string | yes | Lookup key; referenced by navigation `options.page` and route `/page/<url>` |
| `Name` | string | yes | Display name |
| `Layout` | JSON string | no | `PageLayout` definition (below); parsed to `{}` when absent |
| `Lookups` | JSON string | no | Array of page-scoped lookup definitions (below) |
| `Picklists` | JSON string | no | Array of `{ identifier, entity, field }` pickvalue definitions |
| `CustomScripts` | JSON string | no | The five page hooks (see [scripting.md](scripting.md)) |

Raw records may carry additional storage-side fields (e.g. `Id`, `__KEY__`); the adapter reads only the fields above.

**Page-scoped lookups:** `Lookups` entries have the same shape as entity `Lookups` (`{ id, identifier, valueMember, displayMember, type, hasParam }`, see [entities-and-crud.md](entities-and-crud.md)). The page store compiles them into lookup requests and registers them in the same lookup batch as the built-ins (`page.store.ts:126-160`): `type: 1` → `autocomplete` (`autocompletewithparam` when `hasParam`), otherwise `lookup` / `lookupwithparam`; `Picklists` → `pickvalue`. Toolbar items and page layout lookups resolve `identifier` from this map — the 17 built-in identifiers are also available (see [entities-and-crud.md](entities-and-crud.md#built-in-lookups)).

`CustomScripts` keys: `prepareCustomParam`, `paramsInitialized`, `paramEditorInitialized`, `paramEditorValueChanged`, `paramEditorEvent` (`libs/rest-meta-api/src/lib/page.ts:20-26`). Hook signatures in [scripting.md](scripting.md). `prepareCustomParam` runs once per page load with an empty initial custom param (`page.store.ts:165-173`) — its `callback` result becomes the page `customParam` consumed by `crudcontainer` and `statistic` items.

## Layout root (`PageLayout`)

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | no | Page header text (`page.store.ts:82-87`) |
| `documentationEntity` | string | no | Enables the header help button (below) |
| `toolbaritems` | array of `PageToolbarItem` | no | Head-param editors (below) |
| `items` | array of `PageLayoutItem` | yes | Layout item tree (below) |

### Documentation metadata (`documentationEntity`)

- When the layout sets `documentationEntity`, a help button (`bi bi-question-circle`) appears in the page header (`application/header/header.component.html:31-33`).
- Clicking it fetches `GET {meta}/documentation/documentationforentity/{documentationEntity}` (`toolbar/toolbar.effects.ts:9-14`); if no record exists the client shows an info notification instead.
- The record's content renders **read-only** as HTML in a `dxHtmlEditor` popup (`application/documentation/documentation.component.ts:56-66`) — images may be embedded in the HTML.
- **Documentation metadata** is its own metadata document type: `{ Entity, Field, Content }` — `Entity` matches the page's `documentationEntity`, `Content` is the help HTML (endpoints `documentation/selectlist`, `documentation/selectbyid/{id}`, `documentation/documentationforentity/{entity}` — `libs/rest-meta-api/src/lib/documentation.ts`). In the meta-admin pages records are edited via the documentation page, with the built-in `documentationLookup` available for referencing them.

## `toolbaritems` (head-param editors)

Registered factories (`components/index.ts:121-131`): `lookup`, `staticlookup`, `multilookup`, `staticmultilookup`, `number`, `text`, `bool`, `date`, `datetime`, `button`, `dropdownbutton`.

`PageToolbarItem` (`libs/meta-model/src/lib/page.ts:285-320`):

| Field | Honored? | Description |
|---|---|---|
| `type` | yes | Registered type string |
| `name` | yes | Key of the head param the editors feed (via `actions.loadData`); passed as the `name` argument of the param hooks; items without `name` never fire hooks |
| `caption` | yes | Label (select editors) / button text |
| `lookup` | yes | Lookup identifier **at the item root** (not `options.lookup`); select-list types only (`lookup/toolbaritem.ts:27-39`) |
| `options` | partially | `items` on lookup types: static list with `options.valueExpr`/`options.displayExpr` overrides — static items default to `valueExpr: 'value'`, `displayExpr: 'text'` (lowercase, unlike edit-item static lists); on `dropdownbutton`: `items: [{ id, text }]` data source (`keyExpr: 'id'`, `displayExpr: 'text'`, `splitButton: true` — `dropdownbutton/toolbaritem.ts:36-56`) |
| `width` | yes | Defaults: `400px` (lookup), `180px` (dropdownbutton), `auto` (button) |
| `defaultValue` | **no** | Declared in the model but never read — seed values in `paramEditorInitialized` with `editUtil.setEditorOption('<name>', 'value', …)`; there the option names are raw DevExtreme widget options (no option registry) |

Events: value editors fire `paramEditorValueChanged(name, value, …)`; `button` fires `paramEditorEvent(name, 'click', …)`; `dropdownbutton` fires `paramEditorEvent` with event `'click'` — the split button passes `param = undefined`, a menu item click passes the clicked item's **`id`** as `param` (`dropdownbutton/toolbaritem.ts:41-54`, see [scripting.md](scripting.md)). All editors fire `paramEditorInitialized` once registered; after the last one, `paramsInitialized(false, …)` runs (`page.store.ts:244-259`) — the page only loads data once a script calls `actions.loadData()`.

**Head params flow:** the value changed/selected in a toolbar editor reaches the data layer only if a param hook merges it: `actions.loadData({ ...pageParam, <name>: value })` sets the page **head params** (`ScriptActions`, `libs/meta-model/src/lib/page.ts:350-357`), which then feed: the `crudcontainer` list query (`pagecrudcontainer.component.ts:91-93`), tab counter calls (`components/tabs/page/counter.component.ts:65-86`), and statistic data requests (`statistic/statistic.store.ts:58-65`; also `MappingScript` `params` — see [statistics.md](statistics.md)).

## Page item tree

Registered item types (`provideDefaultPageItems`, `components/index.ts:67-71`): `tabs`, `crudcontainer`, `grid`, `map`, `statistic`. `tab` is rendered as the child panel type of `tabs` (`tabs.component.ts:45-47`). Item `options.height` sets the host height of every page item (`layout/page/item.component.ts:52`), `colCount`/`colSpan` its responsive width.

### `tabs` / `tab`

- `tabs` `itemoptions.identifier` (`TabsOptions`): when set, the selected tab **index** round-trips through the URL as a query parameter `<identifier>=current=<index>` and is restored from it (`tabs.component.ts:49-90`).
- `tab` `itemoptions.caption`: panel title. When `itemoptions.entity` is set, the title renders as a **counter badge**: `GET {dataBaseUrl}/count?identifier=<itemoptions.query ?? 'primary'>` with the current page head params (`counter.component.ts:65-86`). If the count call answers **401**, the tab is hidden (`tabNotAuthorized` → `tab.visible = false`, `counter.component.ts:72-75`, `tabs.component.ts:102-104`). A common convention pairs the tab's data query with a dedicated counter query, e.g. data query `open` with counter query `opencount`.

### `crudcontainer`

Establishes the entity/CRUD context for its child items (it provides the meta/crud/data-source services to children, `pagecrudcontainer.component.ts:22-49`):

| `itemoptions` key | Honored? | Description |
|---|---|---|
| `entity` | yes | Entity whose metadata/CRUD endpoints the container binds (`:77`) |
| `query` | yes | List query identifier, default `primary` (`:78`) |
| `params` | yes | Static head params; merged **before** the page head params, so page params win on key conflicts (`:91-93`) |
| `identifier` | declared | Not bound to any state store (see [lists.md](lists.md) caveats) |

### `grid`

Nested inside a `crudcontainer` (inherits its entity/query/data source). Keys read (`pageentitydatagrid.component.ts:54-56`): `itemoptions.layout` (default `primary`), `itemoptions.height` (default `100%`), `itemoptions.identifier` (unused, see caveats). Its own `entity`/`query` are **never read**. Grid semantics: [lists.md](lists.md).

### `map`

Renders the `crudcontainer`'s data source as map markers (`pagemap.component.ts:59-77`): reads `itemoptions.locationMember` (coordinate property); `editLayout` on marker click is hard-coded `primary` (`:96-103`). `entity`/`query`/`displayMember` from `EntityMapOptions` are not read by the page map component.

### `statistic`

Reads only `itemoptions.statistic` — the statistic `Identifier` (`pagestatistic.component.ts:70-78`). It inherits the page's head params and `prepareCustomParam` custom param (`:54-67`); the rendered height comes from the statistic layout's own `height` plus the item's `options.height` host style. Statistics semantics: [statistics.md](statistics.md).

## Example

Layout payload standalone (strict JSON):

```json
{
  "title": "Orders",
  "documentationEntity": "demoorder",
  "toolbaritems": [
    { "type": "datetime", "name": "dateFrom", "caption": "From" },
    { "type": "lookup", "name": "statusfilter", "caption": "Status", "lookup": "demoorderstatus" },
    { "type": "dropdownbutton", "name": "myfilter", "caption": "My filter", "options": { "items": [ { "id": "all", "text": "All" }, { "id": "open", "text": "Open only" } ] } },
    { "type": "button", "name": "reset", "caption": "Reset" }
  ],
  "items": [
    {
      "type": "tabs",
      "options": { "itemoptions": { "identifier": "tab" }, "height": "calc(100vh - 200px)" },
      "items": [
        {
          "type": "tab",
          "options": { "itemoptions": { "caption": "Open", "entity": "demoorder", "query": "open" } },
          "items": [
            {
              "type": "crudcontainer",
              "options": { "itemoptions": { "entity": "demoorder", "query": "open", "params": { "closed": false } } },
              "items": [ { "type": "grid", "options": { "itemoptions": { "layout": "primary" } } } ]
            }
          ]
        },
        {
          "type": "tab",
          "options": { "itemoptions": { "caption": "Analysis", "entity": "demoorder", "query": "open" } },
          "items": [ { "type": "statistic", "options": { "itemoptions": { "statistic": "demoorder-status" } } } ]
        }
      ]
    }
  ]
}
```

Matching `CustomScripts` payload (script bodies — parameter names fixed, see [scripting.md](scripting.md)):

```json
{
  "prepareCustomParam": "util.withLookupList(lookups.demoorderstatus, (states) => callback({ states: states }));",
  "paramsInitialized": "actions.loadData();",
  "paramEditorValueChanged": "if (name == 'statusfilter') { actions.loadData({ ...pageParam, statusfilter: value }); }",
  "paramEditorEvent": "if (name == 'myfilter') { if (param == 'open') { actions.loadData({ ...pageParam, myfilter: 'open' }); } else { actions.loadData(pageParam); } }",
  "paramEditorInitialized": "if (name == 'dateFrom') { editUtil.setEditorOption('dateFrom', 'value', util.beginOfYear()); }"
}
```

Runnable fixture: `fixtures/e2e/page/e2e-orderslist.json`.

## Caveats (verified against source)

- A production layout key `searchparams` (on grids or items) is **never read** by the client — there is no reference to it anywhere in `libs/`. All filtering must run through toolbar head params (`actions.loadData`) and the server-side query they address.
- Unregistered page item types render nothing and log `Unknown page layout item type <type>` (`layout/page/item.component.ts:35-46`). Only `tabs`, `tab`, `crudcontainer`, `grid`, `map`, `statistic` resolve.
- Toolbar `lookup` lives at the **item root** (by design, `PageToolbarItem`); edit/grid items use `options.lookup` — a `lookup` at the root of an edit item is ignored (see [edit-forms.md](edit-forms.md) caveats).
- The counter badge requires `tab` `itemoptions.entity`; a tab without it renders a plain caption. `query` defaults to `primary` — point it at a dedicated count query when the data query is not suitable for counting.
- `toolbaritems.defaultValue` is declared but never read; `paramEditorInitialized` is the only way to seed an editor value.
- A page with toolbar items renders **no data** until `paramsInitialized` (or a param hook) calls `actions.loadData()` (`page.store.ts:244-259`).
- `crudcontainer` `itemoptions.identifier` and page `grid` `itemoptions.identifier` are storage/breadcrumb annotations only — no state persistence (see [lists.md](lists.md)).
- Static toolbar lists default to `valueExpr: 'value'` / `displayExpr: 'text'` (lowercase); edit-form/grid static lists default to the lookup members (`Id`/`Name`) or need explicit `Value`/`Text` expr overrides.
