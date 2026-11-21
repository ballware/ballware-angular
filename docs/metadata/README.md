# Modeling Applications with Metadata

This folder documents how Ballware applications are **modeled** — the raw metadata JSON served by the Ballware metadata backend (`ballware.meta.service`) and consumed by the webclient. It is written so that humans *and* AI assistants can author or generate metadata without hand-coded frontend logic.

The [main README](../../README.md) covers setup and operation of the webclient; these files cover what the metadata itself looks like and how the client interprets it.

> Scope note: the metadata backend itself lives outside this repository. Everything here describes the metadata contract **as consumed by this webclient** (i.e. what `@ballware/rest-meta-api` expects and what `@ballware/dx-renderer` renders).

## Contents

| File | Topic |
|---|---|
| [navigation.md](navigation.md) | Tenant metadata and the navigation layout |
| [entities-and-crud.md](entities-and-crud.md) | Entity metadata envelope, CRUD endpoints, lookups, rights |
| [lists.md](lists.md) | Grid (list) layouts and columns |
| [edit-forms.md](edit-forms.md) | Edit layouts, editors, templates, detail collections |
| [custom-functions.md](custom-functions.md) | Custom add/edit/import/export functions |
| [statistics.md](statistics.md) | Statistic metadata: charts, maps, pivot grids |
| [scripting.md](scripting.md) | `CustomScripts` hooks, compilation model, `ScriptUtil` |

Runnable examples of every envelope type live in [`fixtures/e2e/`](../../fixtures/e2e) (tenant, entity, page, lookup, identity fixtures used by the Cypress suite).

## How metadata flows

```
ballware.meta.service (REST metadata backend)
   GET {meta}/entity/metadataforentity/{entity}
   GET {meta}/page/pagedataforidentifier/{page}
   GET {meta}/tenant/metadatafortenant/{tenant}
   GET {meta}/statistic/metadataforidentifier/{identifier}
        │
        │  raw metadata envelope
        │  (PascalCase fields, layout payloads as embedded JSON strings)
        ▼
@ballware/rest-meta-api                libs/rest-meta-api/src/lib/
   JSON5.parse() of payload strings,
   script bodies wrapped via meta-scripting
        ▼
@ballware/meta-model                   libs/meta-model/src/lib/
   compiled model (camelCase): CompiledEntityMetadata, CompiledPageData,
   CompiledTenant, CompiledStatistic, layout/item/column interfaces
        ▼
@ballware/dx-renderer                  libs/dx-renderer/src/lib/
   registries map item `type` strings to DevExtreme components
   (edit items, grid columns, toolbar items, page items —
   see libs/dx-renderer/src/lib/components/index.ts)
```

Data (as opposed to metadata) is served by a separate backend reachable via the entity `BaseUrl` (see [entities-and-crud.md](entities-and-crud.md)).

## Envelope conventions

- **PascalCase fields** on the raw envelope (`Application`, `Entity`, `GridLayout`, `EditLayout`, `CustomScripts`, …). The compiled model uses the camelCase equivalents (`application`, `gridLayouts`, …).
- **Payload fields are strings containing JSON**: layout definitions, lookup lists, script collections and custom function lists are not sent as JSON objects but as JSON *strings* embedded in the envelope (e.g. `"GridLayout": "[{...}]"`). They are parsed by the adapter with `JSON5.parse`.
- **JSON5 is tolerated, plain strict JSON is recommended.** The backend round-trips these strings and the client parses them with JSON5 (unquoted keys, single quotes allowed). All examples in these docs use strict JSON so they parse with plain `JSON.parse` as well.
- **Script fields are function bodies**, not full functions: each script string is the *body* of a function whose parameter names are fixed by the client (see [scripting.md](scripting.md)).
- Fixtures contain a redundant `Id` row key next to `Identifier` fields; `Id` is the backend storage row id, `Identifier` is the lookup key the client resolves.

A complete raw entity envelope (payload strings escaped; the same content is shown unescaped in the topic files):

```json
{
  "Id": "demoorder",
  "Application": "ballware",
  "Entity": "demoorder",
  "DisplayName": "Demo order",
  "BaseUrl": "{generic}ballware/demoorder",
  "KeyColumn": "Id",
  "StateColumn": "Status",
  "ItemMappingScript": "",
  "ItemReverseMappingScript": "",
  "Lookups": "[{\"id\":\"e2estatus\",\"identifier\":\"e2estatus\",\"valueMember\":\"Id\",\"displayMember\":\"Name\"}]",
  "Picklists": "[]",
  "Templates": "[]",
  "CustomScripts": "{\"commonUtils\":\"\",\"prepareEditLayout\":\"\",\"editorValueChanged\":\"\"}",
  "CustomFunctions": "[{\"id\":\"add\",\"type\":\"default_add\",\"text\":\"New order\",\"editLayout\":\"primary\",\"supportContinue\":false}]",
  "GridLayout": "[{\"identifier\":\"primary\",\"editLayout\":\"primary\",\"title\":\"Orders\",\"allowMultiselect\":false,\"columns\":[{\"type\":\"text\",\"dataMember\":\"OrderNr\",\"caption\":\"Order no\",\"position\":1},{\"type\":\"lookup\",\"dataMember\":\"Status\",\"caption\":\"Status\",\"lookup\":\"e2estatus\",\"position\":3}]}]",
  "EditLayout": "[{\"identifier\":\"primary\",\"items\":[{\"type\":\"text\",\"options\":{\"dataMember\":\"OrderNr\",\"caption\":\"Order no\"}},{\"type\":\"lookup\",\"lookup\":\"e2estatus\",\"options\":{\"dataMember\":\"Status\",\"caption\":\"Status\"}}]}]"
}
```

## Identifier conventions

- Layout identifiers are arbitrary strings per entity/page; the client falls back to **`primary`**:
  - list query identifier: `itemoptions.query ?? 'primary'`
  - grid layout identifier selected by the `layout` option (default `primary`)
  - new/view/edit fetch with the active **edit layout** identifier (`… ?? 'primary'`); the remove confirmation always fetches with `'primary'`
  - **default** add/edit dialogs always save with identifier `'primary'`; only custom functions save with **their own `id`**; import/export use the custom function `id`
- Custom functions are identified by `id` (unique per entity) — the id also forms part of the rights string.

## Rights conventions

Rights are plain strings assigned to the user (typically via identity claims) and checked against:

- `<application>.<entity>.<functionId>` for CRUD/custom function operations (e.g. `ballware.demoorder.edit`)
- `generic.page.<page>` for navigation/page visibility

Extended, script-based rights checks are described in [scripting.md](scripting.md). See `fixtures/e2e/identity/e2e-user.json` for example rights.

## Authoring metadata with AI prompts

When generating metadata (manually or via prompts), follow this checklist:

1. **Pick the right envelope**: entity (`metadataforentity`), page (`pagedataforidentifier`), tenant (`metadatafortenant`), or statistic (`metadataforidentifier`) — see the topic file linked above.
2. **Use PascalCase field names** exactly as documented; only mark fields optional where this reference says optional.
3. **Embed payloads as strict JSON strings** — every quote inside the payload string escaped; no trailing commas, no comments, no single-quoted keys.
4. **Only use registered item `type` names** — the type strings must match the registries in `libs/dx-renderer/src/lib/components/index.ts` (lists in [lists.md](lists.md), [edit-forms.md](edit-forms.md), [statistics.md](statistics.md)).
5. **Scripts are function bodies** with fixed parameter names — see [scripting.md](scripting.md) before writing one.
6. **Cross-check lookups**: every `lookup`/`pickvalue` reference must name an identifier defined in `Lookups`/`Picklists` of the same envelope (or an auto-created state lookup, see [entities-and-crud.md](entities-and-crud.md)).
7. **Validate**: every payload string must parse with `JSON.parse`; the envelope itself must parse as strict JSON.
