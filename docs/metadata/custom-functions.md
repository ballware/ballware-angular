# Custom Functions

Custom functions define the operations the CRUD container offers beyond plain add/view/edit/delete: custom add/edit workflows, batch operations, import/export, and replacements for the built-in default functions. They are the `CustomFunctions` payload of the entity envelope (see [entities-and-crud.md](entities-and-crud.md)).

Model source: `EntityCustomFunction` (`libs/meta-model/src/lib/entity.ts:390-449`). Execution: `libs/ngrx-meta-services/src/lib/crud/crud.store.ts` (`customEdit` effect, `:354-427`); script hooks `prepareCustomFunction` / `evaluateCustomFunction` (see [scripting.md](scripting.md)).

## Schema (`CustomFunctions` payload entries)

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique per entity. Used as **rights suffix** (`<application>.<entity>.<id>`) and as **server-side operation identifier** for save/import/export |
| `type` | string | yes | `'add'` \| `'edit'` \| `'import'` \| `'export'` \| `'default_add'` \| `'default_view'` \| `'default_edit'` |
| `text` | string | yes | Button/menu caption |
| `icon` | string | no | CSS icon class (e.g. `"bi bi-eye-fill"`) |
| `entity` | string | no | **Foreign-entity function**: opens the edit form bound to another entity directly; its `editLayout` is not used |
| `multi` | boolean | no | Function operates on multiple selected rows (batch) |
| `supportContinue` | boolean | no | Offers "save and continue" in the edit dialog (`continueAfterSave`) |
| `externalEditor` | boolean | no | Proprietary editor: `prepareCustomFunction` must supply the editor **url** as its callback param |
| `editLayout` | string | no | Edit layout used for the dialog; defaults to the primary layout |
| `options` | `{ format }` | for import/export | `format`: `"xml"` \| `"json"` \| `"csv"` |

## Default functions

If the entity declares no function of type `default_add` / `default_view` / `default_edit`, the client synthesizes built-ins with ids `add`, `view`, `edit` (translated captions, editLayout `primary`) — `libs/ngrx-meta-services/src/lib/meta/meta.store.ts:67-89`. A declared `default_*` function **replaces** the built-in:

- `default_add` with **`id: "none"`** keeps the built-in add flow: the add action stays, but runs the standard create/save pipeline (`/save?identifier=primary`) instead of the custom-function pipeline (`crud.store.ts:58-62`).
- Replacements with a real id change caption/layout/rights — but the add/edit **dialog save still uses identifier `'primary'`**; only functions run through the custom-function pipeline save with their own id (see [entities-and-crud.md](entities-and-crud.md)).

## Availability

A function is offered when the user holds `<application>.<entity>.<id>`. Row-bound operations (`default_view`, `default_edit`, `edit`) are checked **per row**; all others with a head-level check (`customFunctionAllowed$`, `meta.store.ts:392-396`). Inline grid cell editing uses the `edit` function's permissions.

## Function patterns in practice

The full spectrum seen across production entities:

- **Renamed defaults** — `default_add` / `default_edit` with a custom `id`, `text`, `icon`, and `editLayout` (a custom-labeled dialog for plain create/edit, e.g. "New stock entry", "Adjust quantity").
- **Batch status change** — `edit` + `multi` with a virtual `editLayout` (recipe below); workflow step functions (order/delivery-style) use the same pipeline and refuse via `messageCallback` when `allowedStateLookup` yields no states.
- **Virtual forms backed by a `detailgrid`** — a batch "add rows" dialog with `supportContinue` (recipe below).
- **Scanner/barcode add** — `add` with a dedicated `editLayout`, scan icon, and `interactionKeyboardLine` handling (see [edit-forms.md](edit-forms.md)).
- **Import/export on master data** — `import`/`export` with `options.format: "json"` or `"csv"`.

## Execution flow (`add` / `edit` functions)

1. The user triggers the function (optionally with a multi-row selection when `multi` is set).
2. With `entity` set (foreign-entity function): the edit form for that entity opens directly (`crud.store.ts:356-384`) — no scripts, no save through this entity.
3. Otherwise the **`prepareCustomFunction`** script runs with `(identifier, lookups, util, executeCallback, messageCallback, params, selection)`; default behavior executes the function for **each selected row** (`entity/preparecustomfunction.ts:42`).
4. `executeCallback(param)` opens the **edit dialog** using the function's `editLayout`; `param` becomes the initial values of the edited item. With `externalEditor`, `param` carries the editor url instead.
5. On apply, the **`evaluateCustomFunction`** script runs with `(identifier, continueAfterSave, editUtil, lookups, util, param, executeCallback, messageCallback)`. Its `executeCallback` result is persisted: an **array** triggers `POST /savebatch`, a single object `POST /save` — always with the function's `id` as identifier (`crud.store.ts:401-407,432,456`).
6. `supportContinue` shows the save-and-continue option; `messageCallback` shows a translated notification.

**Import** functions open an upload dialog and send `POST /import?identifier=<functionId>` (`crud.store.ts:522-535`). **Export** functions post the selected row ids to `/exporturl?identifier=<functionId>` and open the returned download URL in a new window (`crud.store.ts:537-548`).

## Example

`CustomFunctions` payload (strict JSON, as embedded in the envelope):

```json
[
  {
    "id": "none",
    "type": "default_add",
    "text": "New order",
    "editLayout": "primary"
  },
  {
    "id": "confirm",
    "type": "edit",
    "text": "Confirm orders",
    "icon": "bi bi-check2-all",
    "multi": true,
    "supportContinue": true,
    "editLayout": "confirm"
  },
  {
    "id": "import",
    "type": "import",
    "text": "Import orders",
    "options": { "format": "csv" }
  },
  {
    "id": "export",
    "type": "export",
    "text": "Export orders",
    "options": { "format": "xml" }
  }
]
```

Matching `CustomScripts` for the `confirm` function:

```json
{
  "prepareCustomFunction": "executeCallback({ Status: 'confirmed', ConfirmNote: '' });",
  "evaluateCustomFunction": "executeCallback({ ...param, ConfirmedAt: new Date().toISOString() });"
}
```

## Recipes

### Batch status change (end-to-end)

Function + layout + scripts for the classic multi-row state change (entity with `StateColumn` → auto-registered `allowedStateLookup`):

```json
{ "id": "state", "type": "edit", "text": "Change status", "icon": "bi bi-arrow-repeat", "multi": true, "editLayout": "state" }
```

```json
{
  "identifier": "state",
  "colCount": 1,
  "items": [
    { "type": "lookup", "options": { "dataMember": "NewStateId", "caption": "New status", "required": true, "valueExpr": "State", "displayExpr": "Name" } },
    { "type": "lookup", "options": { "dataMember": "StatusReason", "caption": "Reason" } }
  ]
}
```

```json
{
  "prepareCustomFunction": "if (identifier == 'state') { util.withLookupList(lookups.allowedStateLookup(selection.map((i) => i.Id)), (states) => { if (states && states.length > 0) { executeCallback({ states: states, items: selection }); } else { messageCallback('Status change not possible'); } }); }",
  "editorEntered": "if (identifier == 'NewStateId') { editUtil.setEditorOption('NewStateId', 'items', item.states); }",
  "evaluateCustomFunction": "if (identifier == 'state') { executeCallback(param.items.map((i) => { i.Status = param.NewStateId; i.StatusReason = i.StatusReason ?? null; return i; })); }"
}
```

- `prepareCustomFunction` computes the **allowed states for the selection** (`allowedStateLookup` accepts an array of keys) and opens the dialog with `{ states, items }` as initial item values — or refuses via `messageCallback` when no state is reachable.
- `editorEntered` seeds the virtual `NewStateId` editor's `items` from `item.states` (no real lookup needed; `valueExpr`/`displayExpr` map the state rows, e.g. `State`/`Name`). Per-state reason gating uses the state row's `ReasonRequired` flag (see [entities-and-crud.md](entities-and-crud.md)).
- `evaluateCustomFunction` maps the selection to an **array** → persisted with `POST /savebatch?identifier=state`; a single object would use `POST /save` — always with the function `id` as server-side identifier, so the backend applies per-item semantics (see caveats).

### Virtual add form backed by a detail grid

`supportContinue` + a `detailgrid` of virtual rows turns the dialog into a repeatable entry mask:

```json
{ "id": "additems", "type": "edit", "text": "Add items", "multi": true, "supportContinue": true, "editLayout": "additems" }
```

```json
{
  "identifier": "additems",
  "items": [
    { "type": "detailgrid", "options": { "dataMember": "items", "caption": "Items", "itemoptions": { "editMode": "row", "add": true, "update": true, "delete": true, "columns": [
      { "type": "lookup", "dataMember": "itemId", "caption": "Item", "lookup": "itemLookup" },
      { "type": "number", "dataMember": "qty", "caption": "Qty" }
    ] } } }
  ]
}
```

```json
{
  "evaluateCustomFunction": "if (identifier == 'additems') { executeCallback(param.items.filter((i) => i.qty > 0)); if (continueAfterSave) { param.items = param.items.map((i) => { i.qty = 0; return i; }); editUtil.setEditorOption('items', 'items', param.items); } }"
}
```

- Only rows with input are sent (array → `savebatch` with `identifier=additems`); what the backend creates from them is its own mapping (often cross-entity records).
- On "save and continue" the hook **resets the grid in place** via `editUtil.setEditorOption('items', 'items', …)` — detail-grid adapters pass options straight to the component, bypassing the editor option registry (see [edit-forms.md](edit-forms.md)).

## Caveats (verified against source)

- Only `prepareCustomFunction`/`evaluateCustomFunction` scripts of the **entity** receive `commonUtils`; both receive `selection`/`param` per the signatures in [scripting.md](scripting.md).
- Default `prepareCustomFunction` **executes immediately for every selected row** — omit the script only when that is the intended behavior.
- `selection` is only populated for function type `edit` (`libs/meta-model/src/lib/entity.ts:333`).
- Foreign-entity functions (`entity` set) bypass the scripts **and** the save pipeline entirely — the target entity's own dialogs/save apply.
- `options.format` exists only for `import`/`export`; other types ignore `options`.
- `multi` is a declaration for batch workflows; batch persistence happens when `evaluateCustomFunction`'s callback returns an **array** (`saveBatch`).
- Production scripts pass a **second argument** to `executeCallback` (a dialog title) — the client callback takes **one** argument and titles the dialog with the function's `text` (`crud.store.ts:385-389`). A second argument has no effect.
- Custom-function saves go through the **entity's own save endpoint** with the function `id` as identifier (`/save` / `/savebatch`). What the backend actually creates or updates — including records on other entities derived from virtual items — is decided server-side; the client contract ends at the payload.
- Production metadata contains function entries with `type: "external"` (aggregations of foreign-entity functions re-listed on a warehouse-style entity). `external` is **not** part of the client type union (`libs/meta-model/src/lib/entity.ts:411`): the client has no special handling — head-level rights check plus the normal custom-function pipeline. Treat it as a backend aggregation artifact and do not author it from the client contract side.
