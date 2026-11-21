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

## Caveats (verified against source)

- Only `prepareCustomFunction`/`evaluateCustomFunction` scripts of the **entity** receive `commonUtils`; both receive `selection`/`param` per the signatures in [scripting.md](scripting.md).
- Default `prepareCustomFunction` **executes immediately for every selected row** — omit the script only when that is the intended behavior.
- `selection` is only populated for function type `edit` (`libs/meta-model/src/lib/entity.ts:333`).
- Foreign-entity functions (`entity` set) bypass the scripts **and** the save pipeline entirely — the target entity's own dialogs/save apply.
- `options.format` exists only for `import`/`export`; other types ignore `options`.
- `multi` is a declaration for batch workflows; batch persistence happens when `evaluateCustomFunction`'s callback returns an **array** (`saveBatch`).
