# Lists (Grid Layouts)

Grid layouts describe the tabular **list** view of a business object (main grids in pages and embedded grids in edit forms). They are the `GridLayout` payload of the entity envelope — an **array** of layouts, each with its own `identifier` (see [entities-and-crud.md](entities-and-crud.md)).

Compiled model source: `libs/meta-model/src/lib/entity.ts`. Renderer: `libs/dx-renderer/src/lib/datacontainer/**` + column factories in `libs/dx-renderer/src/lib/components/**` (registered in `components/index.ts`).

## GridLayout schema

| Field | Type | Required | Description |
|---|---|---|---|
| `identifier` | string | yes | Layout identifier, selected via `itemoptions.layout` (default `primary`) |
| `title` | string | yes | Headline of the table |
| `editLayout` | string | no | Edit layout identifier used for add/edit/view from this grid; falls back to the grid `identifier`, then `primary` (`libs/dx-renderer/src/lib/datacontainer/entitygrid/entitygrid.component.ts:162-165`) |
| `allowMultiselect` | boolean | no | Row multiselect (`select all` / selection indicator toolbar items); effective only on large screens |
| `allowEditing` | boolean | no | Cell editing (`dxo-editing mode="cell"`); effective only on large screens |
| `allowSearchByBarcode` | boolean | no | Adds a barcode/QR scanner search button (`grid.searchByText`) |
| `columns` | array of `GridLayoutColumn` | yes | Column definitions |
| `summaries` | array | no | Group/total summaries (below) |
| `details` | `DetailLayout` | no | Master-detail expansion (below) |

## GridLayoutColumn

`GridLayoutColumn` extends `EditLayoutItemOptions` (see [edit-forms.md](edit-forms.md)) and adds:

| Field | Honored? | Description |
|---|---|---|
| `type` | yes | Column type (must match a registered factory) |
| `dataMember` | yes | Mapped to DevExtreme `dataField` |
| `caption`, `width`, `visible` (default `true`) | yes | Shared default block (`components/utils/defaultcolumn.ts`) |
| `fixedPosition` | yes | `"left"` / `"right"` pins the column |
| `sorting` | yes | Default `sortOrder` (`"asc"` / `"desc"`) |
| `position` | yes | Orders columns left→right before rendering (`utils/columns.ts:34-44`; missing = 0) |
| `precision` | yes, `number` columns only | Display format `{ type: 'fixedPoint', precision }` |
| `editable` | yes | Per-column inline editing gate (default `false`) |
| `editFunction` | yes | On inline edit attempt, opens this custom function for the row instead of cell editing (`datagrid.component.ts:143-153`) |
| `popuplayout` | yes, `popup` columns only | Edit layout identifier for the popup editor (default `primary`, `crud.store.ts:550-556`) |
| `hidingPriority` | **no** | Never set by factories; actively reset to `undefined` on large screens (`datagrid.component.ts:426-432`) |
| edit-only options (`required`, lookup family keys, …) | partially | Some column types ignore them (see per-type notes) |

## Registered column types

Registered for both entity and detail grids in `libs/dx-renderer/src/lib/components/index.ts:141-169`.

| Type | Behavior / keys |
|---|---|
| `bool` | `dataType: 'boolean'`; default block keys |
| `number` | `precision` → `{ type: 'fixedPoint', precision }` (`components/number/column.ts:24-26`); editor `showSpinButtons` |
| `date` | `dataType: 'date'`, format from i18n key `format.date` |
| `datetime` | `dataType: 'datetime'`, format from i18n key `format.datetime` |
| `lookup` | Select list from lookup definition; lookup keys honored (below) |
| `staticlookup` | Same factory as `lookup`; static `items` or member-sourced lists |
| `pickvalue` | Same factory; resolves via pickvalue queries when `lookup` + `pickvalueEntity` + `pickvalueField` are set |
| `multilookup` | Tag-box editing; the whole column object is passed as `editorOptions`; always-active cell editor |
| `staticmultilookup` | Same factory as `multilookup` |
| `string` | Text column; default block keys only |
| `text` | Same factory as `string` (note: the dynamic cell renderer only matches `"string"`, not `"text"`) |
| `popup` | Opens an edit popup with `popuplayout` (default `primary`); **detail grids only** — entity grids throw `openColumnPopup not implemented for entity columns` (`services/entitycolumneditordelegate.service.ts:240-242`) |
| `button` | Declares cell templates `button`/`editbutton`, but no such templates are implemented in the renderer; the working button cell is the `ColumnButtonComponent` reached through `dynamic` columns: text = `hint`, click fires `editorEvent` / `detailEditorEvent` script with event `"click"` |
| `dynamic` | Cell editor chosen at runtime from the **prepared column's `type`** (mutated per row by the `detailGridCellPreparing` script). Only functional in detail grids. Rendered types: `string`, `bool`, `button`, `number`, `date`, `datetime`, `lookup`, `pickvalue`, `multilookup`, `staticmultilookup`, `editpopup` (note: not `text`, not `staticlookup`, and popup requires `editpopup`). In detail grids with `itemoptions.editMode: "instant"`, editable non-popup columns are automatically switched to `dynamic` (`utils/columns.ts:60-64`) |

### Column lookup resolution

For lookup-family columns (`libs/dx-renderer/src/lib/components/utils/columnlookup.ts`), the source resolves in this order:

1. `items` — static list.
2. `lookupMember` — list read from **head params** (entity grids) or the **parent item** (detail grids).
3. `itemsMember` — list read from the row itself (detail grids).
4. `lookup` — lookup identifier, optionally combined with `lookupParam` (query param from head params/parent item) or `pickvalueEntity` + `pickvalueField` (pickvalue query).

`valueExpr` defaults to the lookup's `valueMember` (fallback `Id`), `displayExpr` to `displayMember` (fallback `Name`). Static `items` of shape `{ Value, Text }` need explicit `"valueExpr": "Value"`, `"displayExpr": "Text"`.

## Summaries

```json
{
  "identifier": "primary",
  "summaries": [
    { "dataMember": "Total", "summaryType": "sum", "groupSummary": true, "totalSummary": true }
  ]
}
```

Mapped to DevExtreme group/total summary items with `column: dataMember` and hard-coded `valueFormat: 'fixedPoint'` (`datacontainer/entitygrid/entitygrid.component.ts:35-56`). `summaryType` is passed through untyped — usable values are DevExtreme's: `avg`, `count`, `custom`, `max`, `min`, `sum` (group rows are shown when the grid groups client-side).

## Master-detail (`details`)

`DetailLayout` (`libs/meta-model/src/lib/entity.ts`): `colCount`, `colCountByScreen { sm, lg }`, `height` (default `300px` at render), `items` (full `EditLayoutItem` subtree). Rendered as DevExtreme master-detail, **disabled on small screens**, and a row is expandable only if the `view` function is allowed for it (`entitygrid.component.ts:243-245`).

## Query, paging, and filtering behavior

- The grid loads the **entire query result once** (`GET {baseUrl}/query|all?identifier=<query>` with head params, `loadMode: 'raw'` custom store, `libs/dx-renderer/src/lib/utils/datasource.ts`).
- **Remote sorting/filtering are disabled** (`[remoteOperations]="{ sorting: false, filtering: false }"`); sorting, filtering, grouping and paging all run client-side. Paging itself is enabled **only in `large` responsive mode** (`dxo-paging [enabled]="mode === 'large'"`).
- List query identifier comes from the **`crudcontainer`'s** `itemoptions.query` (default `primary`) — a page `grid` item's own `itemoptions.query` is never read (`pageentitydatagrid.component.ts:52-57`, `pagecrudcontainer.component.ts:78`); see [entities-and-crud.md](entities-and-crud.md).
- Responsive modes `small`/`medium`/`large` (`datacontainer/entitygrid/entitygrid.component.ts:58-68`): filter row, grouping panel, column chooser, editing, and selection are `large`-only; row double-click opens the edit form in `small` mode; row action buttons differ per mode (single `…` button in small/medium; view/edit/delete/print/`…` buttons in large — availability and execution are driven by custom functions, see [custom-functions.md](custom-functions.md)).
- Excel export is fully client-side (`exportDataGrid` + `exceljs` + `file-saver`, `datagrid.component.ts:434-450`), file name `<displayName>_<YYYYMMDD>.xlsx`.
- Inline cell editing updates through the CRUD save pipeline; `allowEditing` gates the DevExtreme editing state and `editAllowed` gates per row (`datagrid.component.ts:127-155`).

## Example

Strict JSON `GridLayout` payload:

```json
[
  {
    "identifier": "primary",
    "title": "Orders",
    "editLayout": "primary",
    "allowMultiselect": true,
    "allowEditing": false,
    "allowSearchByBarcode": false,
    "columns": [
      { "type": "text", "dataMember": "OrderNr", "caption": "Order no", "position": 1, "sorting": "asc", "fixedPosition": "left" },
      { "type": "lookup", "dataMember": "CustomerId", "caption": "Customer", "lookup": "customers", "position": 2 },
      { "type": "pickvalue", "dataMember": "Status", "caption": "Status", "lookup": "orderstatus", "pickvalueEntity": "demoorder", "pickvalueField": "Status", "position": 3 },
      { "type": "staticlookup", "dataMember": "Priority", "caption": "Priority", "items": [ { "Value": "low", "Text": "Low" }, { "Value": "high", "Text": "High" } ], "valueExpr": "Value", "displayExpr": "Text", "position": 4 },
      { "type": "number", "dataMember": "Total", "caption": "Total", "precision": 2, "position": 5 },
      { "type": "date", "dataMember": "DeliveryDate", "caption": "Delivery", "position": 6 },
      { "type": "bool", "dataMember": "Urgent", "caption": "Urgent", "visible": false, "position": 7 }
    ],
    "summaries": [
      { "dataMember": "Total", "groupSummary": false, "totalSummary": true, "summaryType": "sum" }
    ],
    "details": {
      "colCount": 2,
      "items": [
        { "type": "text", "options": { "dataMember": "Notes", "caption": "Notes" } },
        { "type": "lookup", "options": { "dataMember": "Status", "caption": "Status", "lookup": "orderstatus" } }
      ]
    }
  }
]
```

## Caveats (verified against source)

- `hidingPriority` is unused: no factory sets it and it is cleared on large screens.
- `identifier` on grids / `itemoptions.identifier` (storageIdentifier) is **not** bound to any state store — no DevExtreme `stateStore` is used, so column/page state is not persisted (NgRx CRUD state is keyed by breadcrumb route, not layout identifier).
- Remote sorting/filtering disabled: every list loads fully client-side before paging — keep default queries bounded server-side.
- In `dynamic` cells, `text` columns don't render (renderer matches `"string"` only) and popups require type `"editpopup"`, not `"popup"`.
- `popup` and `dynamic` columns are effectively detail-grid-only features.
- The declared `button`/`editbutton` cell templates of `button` columns are not implemented; working button cells come from `dynamic` columns (see table above).
- Summary `valueFormat` is hard-coded `fixedPoint` — currency formatting is not applied.
- Master-detail, filtering UI, multiselect, inline editing, and paging are suppressed on small screens.
