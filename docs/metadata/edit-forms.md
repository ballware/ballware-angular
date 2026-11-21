# Edit Forms (Edit Layouts)

Edit layouts describe the form used for **add / edit / view** of a business object. They are the `EditLayout` payload of the entity envelope (see [entities-and-crud.md](entities-and-crud.md)) — an **array** of layouts, each with its own `identifier`.

Compiled model source: `libs/meta-model/src/lib/entity.ts`. Renderer: `@ballware/dx-renderer` edit item registry (`libs/dx-renderer/src/lib/components/index.ts`).

## EditLayout schema

| Field | Type | Required | Description |
|---|---|---|---|
| `identifier` | string | yes | Layout identifier; add/view/edit/save operations resolve the layout by identifier (default `primary`) |
| `colCount` | number | no | Columns of the form layout |
| `colCountByScreen` | `{ sm?: number; lg?: number }` | no | Responsive column counts |
| `fullscreen` | boolean | no | Present the form in a full-screen edit popup |
| `items` | array of `EditLayoutItem` | yes | Form items |

> A `title` key appears in some fixtures but is not part of `EditLayout` and is never read.

## EditLayoutItem schema

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | yes | Item type; must match a registered type (table below). `template` is handled before rendering (see Templates) |
| `ignore` | boolean | no | Skip the item during rendering |
| `options` | `EditLayoutItemOptions` | no | Item options (below) |
| `colCount` | number | no | Columns used to lay out child `items` (container types) |
| `colSpan` | number | no | Columns the item occupies in the parent layout |
| `items` | array of `EditLayoutItem` | no | Child items (container types: `tabs`, `group`, `template` materialization) |

## Common options (`EditLayoutItemOptions`)

Which component honors each option is listed per type below.

| Option | Honored by | Notes |
|---|---|---|
| `caption` | most editors | Label text. **Ignored by `button`, `group` honors it, `attachments` ignores it.** On `button`, `hint` is rendered as the button text instead |
| `dataMember` | most editors | Property of the business object bound to the editor |
| `visible` | most editors | Default `true` |
| `required` | editors with validation host | Adds a required validation rule; ignored on `button`, `tabs`, `group`, `map`, `entitygrid`, `detailgrid`, `detailtree`, `attachments`, `statistic` |
| `readonly` | most editors | Combined with the global read-only edit mode |
| `lookup` | lookup family | Lookup identifier from the entity `Lookups` list |
| `lookupParam` | lookup family | Data member whose value is passed as lookup query param (falls back to the literal `lookupParam` value if the property is unset) |
| `pickvalueEntity` / `pickvalueField` | **grid columns only** | Fallback entity/field for `pickvalue` queries; not read by edit components |
| `valueExpr` / `displayExpr` / `hintExpr` | lookup family | Data members in the lookup result used as value/display/hint; defaults below |
| `acceptCustomValue` | lookup family | Allow free user input as value |
| `itemsMember` | lookup family | Data member of the business object holding a ready-made select list |
| `lookupMember` | **grid columns only** | Data member inside the *lookup params* holding a select list |
| `lookupGroupBy` | lookup family | Lookup result property used to group the select list |
| `items` | lookup family | Static select list: `Array<{ "Value": string, "Text": string }>` |
| `hint` | `button` (as button text) | Declared as tooltip for editors but only `button` reads it |
| `height` | all (container styling `auto` default); component-level for `richtext` (`300px`), `json`/`javascript`/`sql` (`300px`), `map` (`100%`), `tabs`, `detailgrid`/`detailtree`, `entitygrid` | |
| `width` | `button`, `tabs` only | Other editors are fixed-width `100%` |
| `itemoptions` | type-specific | See type tables below |
| `validations` | editors with validation host | `Array<{ identifier, message }>` — custom rules, see Validations |

## Lookup resolution

For editors with a select list (`lookup`, `staticlookup`, `pickvalue`, `multilookup`, `staticmultilookup`, `multivalue`, `staticbuttongroup`) the selection source resolves in this order (`libs/dx-renderer/src/lib/directives/lookup.ts`, `libs/dx-renderer/src/lib/utils/lookupbuilder.ts`):

1. `items` — static list from metadata.
2. `itemsMember` — list taken from the business object property.
3. `lookup` — lookup definition from the entity (with `lookupParam` when the query needs a param).

`valueExpr` defaults to the lookup's `valueMember` (fallback `Id`), `displayExpr` to `displayMember` (fallback `Name`). Static `items` therefore need `"valueExpr": "Value"` / `"displayExpr": "Text"` overrides. `pickvalue` resolves against the entity's `Picklists` (see [entities-and-crud.md](entities-and-crud.md)).

## Registered edit item types

All types registered in `libs/dx-renderer/src/lib/components/index.ts`. Keys read **by the component itself** are listed; "none" means `itemoptions` is not read at all.

| Type | Component | `itemoptions` keys actually read | Notes |
|---|---|---|---|
| `button` | `EditLayoutButtonComponent` | none | `hint` is the button text; click fires `editorEvent` script with event `click`; `required`/`validations` inert |
| `staticbuttongroup` | `EditLayoutStaticButtonGroupComponent` | none | Single-select button group over lookup `items`/lookup list; first item auto-selected when value empty |
| `text`, `mail` | `EditLayoutTextComponent` | `allowScanner` | `mail` enables built-in e-mail validation |
| `textarea` | `EditLayoutTextareaComponent` | `allowSpeech` | Speech recognition input |
| `richtext` | `EditLayoutRichtextComponent` | none | Hardcoded toolbar |
| `number` | `EditLayoutNumberComponent` | `min`, `max` | Spin/clear buttons hardcoded |
| `bool` | `EditLayoutBoolComponent` | none | Nullable boolean |
| `toggle` | `EditLayoutToggleComponent` | none | Non-null boolean |
| `date`, `datetime` | `EditLayoutDatetimeComponent` | none | `displayFormat` comes from i18n keys `format.date` / `format.datetime`; no `min`/`max` metadata options |
| `lookup`, `staticlookup`, `pickvalue` | `EditLayoutLookupComponent` | none | dx-select-box; lookup family keys from `options` |
| `multilookup`, `staticmultilookup`, `multivalue` | `EditLayoutMultilookupComponent` | none | dx-tag-box; value defaults to `[]` |
| `tabs` | `EditLayoutTabsComponent` | — | Children must have `type: "tab"` with `options.caption`/`options.icon`; persists selected tab **index** into `dataMember` (see caveats) |
| `group` | `EditLayoutGroupComponent` | none | `caption` + `colCount` + child `items`; ignores `dataMember`/`visible`/`readonly`/`required` |
| `map` | `EditLayoutMapComponent` | none | Google Maps key from settings; provider/zoom hardcoded |
| `entitygrid` | `EditLayoutEntityDataGridComponent` | `customParam`, `readOnly`, `headParams`, `query` (default `primary`), `layout` (default `primary`) | Embedded list of a (foreign) entity; `dataMember` doubles as the entity identifier |
| `detailgrid` | `EditLayoutDetailDataGridComponent` | see Detail collections | Inline collection editing |
| `detailtree` | `EditLayoutDetailTreeListComponent` | see Detail collections | Tree-list collection editing |
| `json`, `javascript`, `sql` | `EditLayoutCodeComponent` | `prefixCode`, `suffixCode`, `snippets` (`{ snippet, label, info, detail }`) | CodeMirror editor; language from `type` |
| `attachments` (alias `attachements`) | `EditLayoutAttachmentDataGridComponent` | none | Attachment grid bound to the current edit session (entity/id), not to `dataMember` |
| `statistic` | `EditLayoutStatisticComponent` | `identifier`, `params` | Embeds a statistic; see [statistics.md](statistics.md). `itemoptions.statistic` is **not** read by the edit component |

## Validations

- `options.validations: Array<{ identifier, message }>` attaches an async validation rule per entry; the client calls the `editorValidating` script with the rule `identifier` and the current value; `true` passes (`libs/dx-renderer/src/lib/directives/validation.ts`).
- `required: true` adds a built-in required rule; `mail` adds an e-mail rule.
- Messages render inline per editor and in the form's validation summary.
- Types without a validation host (see table) ignore `required`/`validations` entirely.

## Templates

Edit items of `type: "template"` are **materialized before rendering** (`libs/ngrx-meta-services/src/lib/meta/meta.store.ts:291-328`):

```json
{
  "type": "template",
  "options": {
    "itemoptions": {
      "scope": "tenant",
      "identifier": "customerAddressBlock"
    }
  }
}
```

- `scope` is `"tenant"` (tenant envelope `Templates`) or `"meta"` (entity envelope `Templates`).
- `identifier` selects the template `{ identifier, definition }`, where `definition` is a full `EditLayoutItem` subtree.
- On materialization the item's `type`, `colCount`, `colSpan`, `options`, and `items` are replaced by the template definition, then the `prepareMaterializedEditItem` script may post-adjust it (see [scripting.md](scripting.md)).

## Runtime editor adjustment (`EditUtil`)

`editorInitialized` / `editorEntered` / `editorValueChanged` scripts receive an `EditUtil` with `getEditorOption(dataMember, option)` / `setEditorOption(dataMember, option, value)`. The recognized option identifiers are exactly: `value`, `visible`, `readonly`, `required`, `acceptCustomValue`, `items`, `min`, `max` (`libs/renderer-commons/src/lib/directives/edititemlivecycle.ts` plus the option registrations in `value.ts`, `visible.ts`, `readonly.ts`, `required.ts`, `lookup.ts`, `editnumber.component.ts`). Anything else throws `Unsupported option <...>`. (Grid/detail/toolbar adapters bypass this registry and pass options to DevExtreme directly.)

## Detail collections (`detailgrid` / `detailtree`)

Editing options of a detail collection (`itemoptions`, implemented by `libs/dx-renderer/src/lib/directives/detailcollectionediting.ts`):

| Option | Default | Description |
|---|---|---|
| `columns` | — (required for render) | `Array<GridLayoutColumn>` defining the inline editors — see [lists.md](lists.md) for column options |
| `editMode` | `"row"` | `"row"` (row insert/delete buttons) or `"instant"` (cell editing) |
| `add` | `false` | Allow inserting rows |
| `update` | `false` | Allow modifying rows |
| `delete` | `false` | Allow deleting rows |
| `showSource` | `false` | Offers a toggle to the raw JSON view of the collection |

- `options.dataMember` is the collection property and gates the whole component; `options.caption`/`options.height` are honored; `options.readonly` forces row mode.
- Column options honored in detail cells: `type`, `dataMember`, `caption`, `width`, `fixedPosition`, `editable` (default `false`), `visible`, `sorting`, `required`, lookup family keys (`lookup`, `items`, `itemsMember`, `lookupMember`, `lookupParam`, `pickvalueEntity`, `pickvalueField`, `valueExpr`, `displayExpr`, `hintExpr`, `acceptCustomValue`, `lookupGroupBy`), `position`, `editFunction`.
- Row validation uses the `detailGridRowValidating` script; cell option adjustment uses `detailGridCellPreparing`; seeding new rows uses `initNewDetailItem` (see [scripting.md](scripting.md)).

## Example

Strict JSON `EditLayout` payload covering the most common patterns:

```json
[
  {
    "identifier": "primary",
    "colCount": 2,
    "colCountByScreen": { "sm": 1, "lg": 2 },
    "items": [
      {
        "type": "group",
        "colCount": 2,
        "options": { "caption": "Head" },
        "items": [
          { "type": "text", "options": { "dataMember": "OrderNr", "caption": "Order no", "required": true } },
          { "type": "lookup", "options": { "dataMember": "CustomerId", "caption": "Customer", "lookup": "customers", "valueExpr": "Id", "displayExpr": "Name" } },
          { "type": "number", "options": { "dataMember": "Total", "caption": "Total" }, "colSpan": 2 },
          { "type": "bool", "options": { "dataMember": "Urgent", "caption": "Urgent" } }
        ]
      },
      {
        "type": "staticlookup",
        "options": {
          "dataMember": "Priority",
          "caption": "Priority",
          "items": [ { "Value": "low", "Text": "Low" }, { "Value": "high", "Text": "High" } ],
          "valueExpr": "Value",
          "displayExpr": "Text"
        }
      },
      {
        "type": "detailgrid",
        "options": {
          "dataMember": "Positions",
          "caption": "Positions",
          "itemoptions": {
            "add": true,
            "update": true,
            "delete": true,
            "editMode": "instant",
            "showSource": true,
            "columns": [
              { "type": "text", "dataMember": "Article", "caption": "Article", "required": true },
              { "type": "number", "dataMember": "Qty", "caption": "Qty" },
              { "type": "number", "dataMember": "Price", "caption": "Price", "precision": 2 }
            ]
          }
        }
      },
      {
        "type": "tabs",
        "options": { "caption": "Details" },
        "items": [
          {
            "type": "tab",
            "options": { "caption": "Notes" },
            "items": [ { "type": "textarea", "options": { "dataMember": "Notes", "caption": "Notes" } } ]
          },
          {
            "type": "tab",
            "options": { "caption": "Attachments" },
            "items": [ { "type": "attachments" } ]
          }
        ]
      }
    ]
  }
]
```

## Caveats (verified against source)

- **`tabs` persists the selected tab index** (number) into the bound `dataMember` — the tab state round-trips with the business object (`libs/dx-renderer/src/lib/components/tabs/edit/tabs.component.ts`). `itemoptions.identifier` is **not** used by the edit tabs component.
- `precision` on edit `number` editors is ignored; it only affects grid columns (see [lists.md](lists.md)).
- `pickvalueEntity`/`pickvalueField`/`lookupMember` are not read by edit editors — only by grid columns.
- `width` is only honored on `button` and `tabs`.
- `uniqueKey` and `fetchParams` on `entitygrid` `itemoptions` are declared but never read.
- Fixtures occasionally place `lookup` at the **item root** (e.g. `fixtures/e2e/entity/demoorder.json`); the client reads `options.lookup` on edit items — at the item root it is ignored (on grid columns the option lives at the column root by design, since columns extend `EditLayoutItemOptions`).
- A `fieldset` component exists (`libs/dx-renderer/src/lib/components/fieldset/`) but is **not registered** — do not use `fieldset` as a type.
- `attachements` is a registered typo alias of `attachments`.
- `GridLayoutColumn` (see [lists.md](lists.md)) inherits all edit-only options, and several column types silently ignore some of them.
