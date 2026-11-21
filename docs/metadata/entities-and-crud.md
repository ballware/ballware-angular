# Entities, CRUD, Lookups, and Rights

The **entity envelope** is the core metadata document of a business application: one document per business object type, holding its data endpoints, layouts, lookups, custom functions, scripts, and the columns that identify and state it.

Compiled model source: `libs/meta-model/src/lib/entity.ts` (`CompiledEntityMetadata`). Data flow: `libs/ngrx-meta-services/src/lib/meta/meta.store.ts` + `crud/crud.store.ts`; REST adapters: `libs/rest-meta-api/src/lib/`.

## Envelope

Metadata endpoint: `GET {meta}/entity/metadataforentity/{entity}` (tooling variants: `entity/selectlist`, `entity/selectbyid/{id}`, `entity/selectbyidentifier/{identifier}`).

Raw envelope (`libs/rest-meta-api/src/lib/entity.ts:10-26`):

| Field | Type | Required | Description |
|---|---|---|---|
| `Application` | string | yes | Application scope; first part of rights strings |
| `Entity` | string | yes | Entity identifier; second part of rights strings |
| `DisplayName` | string | yes | Display name used in dialogs/titles |
| `BaseUrl` | string | yes | Data (CRUD) endpoint base; may contain service placeholders (see below) |
| `KeyColumn` | string | yes | Property holding the unique id; used for `byId`, remove, export |
| `StateColumn` | string | yes | Property holding the state code; presence auto-registers state lookups (see Lookups) |
| `GridLayout` | JSON string | yes | Array of `GridLayout` — see [lists.md](lists.md) |
| `EditLayout` | JSON string | yes | Array of `EditLayout` — see [edit-forms.md](edit-forms.md) |
| `Lookups` | JSON string | no | Array of lookup definitions (see Lookups) |
| `Picklists` | JSON string | no | Array of pickvalue definitions (see Lookups) |
| `Templates` | JSON string | no | Array of `{ identifier, definition }` meta-scoped edit-item templates — see [edit-forms.md](edit-forms.md) |
| `CustomFunctions` | JSON string | no | Array of custom function definitions — see [custom-functions.md](custom-functions.md) |
| `ItemMappingScript` / `ItemReverseMappingScript` | script string | no | Applied to every item after `query`/`byId`/`new` fetch / before save — see [scripting.md](scripting.md) |
| `CustomScripts` | JSON string | no | Script collection — see [scripting.md](scripting.md) |

A complete envelope example is in [README.md](README.md#envelope-conventions).

## BaseUrl and service placeholders

`BaseUrl` addresses the **data** backend (a different service than the metadata backend). Placeholders are expanded **only** when the data API factory is created (`libs/rest-meta-api/src/lib/index.ts:196-204`); the metadata adapter uses `BaseUrl` unexpanded:

| Placeholder | Replaced with (webclient env var) |
|---|---|
| `{identity}` | `BALLWARE_IDENTITYURL` + `/` |
| `{meta}` | `BALLWARE_METAURL` + `/` |
| `{tenant}` | `BALLWARE_TENANTURL` + `/` |
| `{generic}` | `BALLWARE_GENERICURL` + `/` |
| `{document}` | `BALLWARE_DOCUMENTURL` + `/` |
| `{ml}` | `BALLWARE_MLURL` + `/` |
| `{storage}` | `BALLWARE_STORAGEURL` + `/` |

(`apps/webclient/src/app/app.config.ts:66-77`.) Expansion uses `String.replace` — **only the first occurrence** of each placeholder per `BaseUrl` is replaced. Typical value: `"{generic}ballware/demoorder"`.

## CRUD endpoints

All paths below are relative to the expanded `BaseUrl`. Query parameters are appended per `additionalParamsToUrl` (`libs/rest-meta-api/src/lib/util.ts:8-26`): array values emit one `key=value` pair per element. **Head params are never appended** to `byId`, `save`, `savebatch`, `import`, or `exporturl`.

| Operation | Request | Notes |
|---|---|---|
| List | `GET {base}/query?identifier=<queryId>&<params>` — or `GET {base}/all?identifier=<queryId>` when there are **no** params | `queryId` from the container's query identifier (default `primary`) |
| Count | `GET {base}/count?identifier=<queryId>[&<params>]` | Response `{ count }`; used for tab counters |
| Load single | `GET {base}/byId?identifier=<functionId>&id=<keyValue>` | `keyValue` = value of `KeyColumn` |
| New skeleton | `GET {base}/new?identifier=<editLayoutId>` — or `GET {base}/newquery?identifier=<editLayoutId>&<params>` when head params exist | |
| Save | `POST {base}/save?identifier=<saveId>` body: item JSON | |
| Batch save | `POST {base}/savebatch?identifier=<saveId>` body: item array JSON | |
| Remove | `DELETE {base}/remove/{id}` | |
| Import | `POST {base}/import?identifier=<functionId>` multipart, field `files[]` | |
| Export | `POST {base}/exporturl?identifier=<functionId>` body `id=<id>&id=…` (form-urlencoded) → response `{ Id, TenantId }` → client opens `GET {base}/download/{TenantId}/{Id}` in a new window | |

### Server-side identifiers per operation

| Operation | Identifier sent |
|---|---|
| list query | `itemoptions.query ?? 'primary'` from the `crudcontainer` |
| new (add dialog) | active add function's `editLayout ?? 'primary'` |
| byId for view/edit | active view/edit function's `editLayout ?? 'primary'` |
| byId for remove confirmation | **always `'primary'`** (`crud.store.ts:322`) |
| save / savebatch | **default add/edit dialogs: always `'primary'`** — they pass no custom function (`crud.store.ts:238,301`); only custom functions executed via `customEdit` save with **their own `id`** (`crud.store.ts:432,456`) |
| import / exporturl | the custom function's `id` |

## Lookups and picklists

`Lookups` payload entries (`CompiledEntityMetadata.lookups`, `libs/meta-model/src/lib/entity.ts:944-951`):

| Field | Type | Description |
|---|---|---|
| `identifier` | string | Key referenced by layout `lookup` options |
| `id` | string | Lookup id on the metadata backend |
| `valueMember` | string | Property used as editor value (fallback `Id`) |
| `displayMember` | string | Property used as display text (fallback `Name`) |
| `type` | number | `1` = autocomplete (free-text suggestion list); otherwise select list |
| `hasParam` | boolean | Lookup query requires a parameter (`lookupParam`) |

`Picklists` payload entries: `{ identifier, entity, field }` — resolved as **pickvalue** queries against the data backend (`{base}` of `entity`/`field`); referenced through `lookup` on `pickvalue` editors/columns or through `pickvalueEntity`/`pickvalueField` (see [lists.md](lists.md)).

**Auto-created state lookups:** when `StateColumn` is set, the client additionally registers lookups `stateLookup` (all states), `allowedMetaStateLookup` (states allowed by metadata), and `allowedStateLookup` (states allowed for the current tenant) — `libs/ngrx-meta-services/src/lib/meta/meta.store.ts:147-167`. A `lookup` option may reference these identifiers without any `Lookups` entry.

### Built-in lookups

Independently of the entity's `Lookups`/`Picklists` payload, every lookup request batch registers **17 built-in lookup identifiers** (`libs/ngrx-meta-services/src/lib/lookup/lookup.store.ts:519-536`). They sit in the same identifier map as the entity lookups (`lookupbuilder.ts` resolves `lookups[identifier]` — `libs/dx-renderer/src/lib/utils/lookupbuilder.ts:345-349`), so any `lookup` option in a layout, grid column, or detail-grid column can reference them without a `Lookups` entry.

| Identifier | Backed by | `valueMember` / `displayMember` |
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
| `entityIdentifierLookup` | `MetaEntityApi` | `Entity` / `Name` — the editor value is the **entity name**, not the id |
| `entityRightLookup` | `MetaEntityApi.rightSelectList()` / `rightSelectById()` (endpoints `entity/selectlistrights`, `entity/rightselectbyid/{id}` — `libs/rest-meta-api/src/lib/entity.ts:157-169`) | `Id` / `DisplayName` |
| `entityStateLookup` | `MetaProcessingstateApi.selectListForEntity(param)` — **LookupCreator**: the lookup param must be the **entity name** (via `lookupParam`) | `State` / `Name` |
| `entityPickvalueLookup` | `MetaPickvalueApi.selectListForEntityAndField(entity, field)` — **PickvalueCreator** driven by `pickvalueEntity`/`pickvalueField` | empty — override with `valueExpr`/`displayExpr` |

- The entity-scoped creators are declared at `lookup.store.ts:235-249` (`entityRightLookup`), `:251-265` (`entityStateLookup`), `:267-282` (`entityPickvalueLookup`).
- **Entity definitions shadow built-ins:** the `Lookups`/`Picklists` requests are assigned to the same batch map *after* the built-ins (`lookup.store.ts:538-625`) and `updateLookups` replaces the whole record per batch (`:500-504, 628`) — a `Lookups` entry with the same `identifier` wins.
- Registration is unconditional inside `requestLookups`; all backing APIs are constructor-injected (`lookup.store.ts:451-465`) and provided by the standard app wiring (`provideMetaBackendRestApi()` / `provideIdentityKeycloakRestApi()` — `apps/webclient/src/app/app.config.ts:100-103`). Batches are issued by the entity store (`meta.store.ts:169`) and the page store (`page.store.ts:160`).

Grid columns referencing built-ins — no `Lookups` entry involved:

```json
[
  { "type": "lookup", "dataMember": "OwnerId", "caption": "Owner", "lookup": "userLookup" },
  { "type": "lookup", "dataMember": "EntityName", "caption": "Entity", "lookup": "entityIdentifierLookup" }
]
```

## Rights

Rights are plain claim strings on the user (see `fixtures/e2e/identity/e2e-user.json`). The client checks:

- **`<Application>.<Entity>.<functionId>`** for every operation, where `functionId` is the default function id (`add`, `view`, `edit`, `delete`) or the custom function's `id` (`meta.store.ts:382`).
- Per-row checks apply for function types `default_view`, `default_edit`, `edit` when a row is in context; otherwise a head-level check applies (`customFunctionAllowed$`, `meta.store.ts:392-396`).
- `extendedRightsCheck` (entity) and `RightsCheckScript` (tenant) can override the claim-based decision (see [scripting.md](scripting.md)).
- Page visibility uses `generic.page.<page>` — see [navigation.md](navigation.md).

## Example (payload view)

Lookups and picklists payloads of an entity envelope (strict JSON, as embedded in the `Lookups`/`Picklists` strings):

```json
[
  { "id": "customers", "identifier": "customers", "valueMember": "Id", "displayMember": "Name", "type": 0, "hasParam": false },
  { "id": "orderstatus", "identifier": "orderstatus", "valueMember": "Id", "displayMember": "Name", "type": 1, "hasParam": true }
]
```

```json
[
  { "identifier": "orderstatusvalues", "entity": "demoorder", "field": "Status" }
]
```

Runnable fixture: `fixtures/e2e/entity/demoorder.json`.

## Caveats (verified against source)

- Save identifier of **default** add/edit dialogs is always `'primary'` — even when the entity replaces `default_add`/`default_edit` with a custom function (only functions executed through the custom-function pipeline save with their `id`).
- The remove confirmation always fetches the row with `byId('primary', …)` regardless of configured edit layouts.
- `BaseUrl` placeholders expand only on first occurrence, and only for the data API — `createMetaBackendEntityApi` (metadata calls) never expands them.
- When a list query has **no** head params, the client calls `all` instead of `query`.
- `new` with head params goes to `newquery`; without params to plain `new`.
- Lookup `type` is a **number** (`1` = autocomplete) in the payload, while compiled lookup requests use string types (`lookup`, `lookupwithparam`, `pickvalue`, `autocomplete`, `autocompletewithparam`, `state`, `metastateallowed`, `tenantstateallowed` — `libs/meta-services/src/lib/lookup.service.ts:81-93`).
