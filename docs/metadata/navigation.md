# Navigation and Tenant Metadata

Navigation is defined per **tenant**. The client loads the tenant envelope from the metadata backend and renders a navigation tree from its `Navigation` payload.

## Envelope

Endpoint: `GET {meta}/tenant/metadatafortenant/{tenant}` (also `GET {meta}/tenant/allowed` for the list of tenants a user may enter, `selectlist`/`selectbyid` variants for tooling).

Raw envelope (`libs/rest-meta-api/src/lib/tenant.ts`):

| Field | Type | Required | Description |
|---|---|---|---|
| `Id` | string | yes | Unique tenant identifier |
| `Name` | string | yes | Display name of the tenant |
| `Navigation` | JSON string | no | `NavigationLayout` definition, see below |
| `Templates` | JSON string | no | Array of `{ identifier, definition }` tenant-scoped edit-item templates (see [edit-forms.md](edit-forms.md)) |
| `RightsCheckScript` | script string | no | Custom rights check function body (see [scripting.md](scripting.md)) |

Compiled into `CompiledTenant` (`libs/meta-model/src/lib/tenant.ts`) as `id`, `name`, `navigation`, `templates`, `hasRight`.

## NavigationLayout schema

Source: `libs/meta-model/src/lib/tenant.ts`

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | yes | Headline for the tenant application |
| `defaultUrl` | string | no | Page activated when the tenant root URL is entered |
| `items` | array of `NavigationLayoutItem` | yes | Navigation tree |

`NavigationLayoutItem`:

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `'page'` \| `'group'` \| `'section'` | yes | Item type |
| `options.page` | string | for `page` | Identifier of the page (resolved via `pagedataforidentifier`); **required** for the item to render |
| `options.url` | string | no | Route segment; the client always navigates to `/page/<options.url>` — there is no external-URL handling in code |
| `options.caption` | string | no | Caption shown in navigation (types `page` and `group`) |
| `options.icon` | string | no | Optional icon for types `page` and `group` |
| `items` | array of `NavigationLayoutItem` | only for `group`/`section` | Child items |

## Visibility and routing rules

Implemented in `libs/ngrx-meta-services/src/lib/tenant/tenant.reducer.ts` and `libs/dx-renderer/src/lib/page/defaultredirect/`:

- A `page` item is shown only if `options.page` is set **and** the user holds the right `generic.page.<page>`, where `<page>` is `options.page` (`tenant.reducer.ts:18-19`). Selecting it navigates to the client route `/page/<options.url>` (`tenant.reducer.ts:26`, `drawer.component.ts:54-63`).
- A `group` renders as a collapsible header (`options.caption` / `options.icon`) and is **only rendered if at least one allowed child item exists**.
- A `section` is transparent: its children are hoisted into the parent level (useful for grouping structure in the metadata without an extra level in the UI).
- `defaultUrl` drives the wildcard redirect: entering the tenant root (or an unknown client URL) redirects to `/page/<defaultUrl>` (catch-all route, `defaultredirect.component.ts:38-40`).
- Despite the "external page" comment on the model (`libs/meta-model/src/lib/tenant.ts`), there is **no external-URL branch** in the renderer — `options.url` is always routed as `/page/<url>`.

## Example

Full raw envelope (payload embedded as an escaped string):

```json
{
  "Id": "e2e",
  "Name": "E2E tenant",
  "Navigation": "{\"title\":\"E2E tenant\",\"defaultUrl\":\"e2e-orderslist\",\"items\":[{\"type\":\"page\",\"options\":{\"page\":\"e2e-orderslist\",\"url\":\"e2e-orderslist\",\"caption\":\"Orders\"}},{\"type\":\"group\",\"options\":{\"caption\":\"Master data\",\"icon\":\"icon-settings\"},\"items\":[{\"type\":\"page\",\"options\":{\"page\":\"e2e-customers\",\"url\":\"e2e-customers\",\"caption\":\"Customers\"}}]},{\"type\":\"section\",\"items\":[{\"type\":\"page\",\"options\":{\"page\":\"e2e-reports\",\"url\":\"e2e-reports\",\"caption\":\"Reports\",\"icon\":\"icon-print\"}}]}]}",
  "Templates": "[]",
  "RightsCheckScript": "return (userinfo.Rights || []).indexOf(right) >= 0;"
}
```

The same `Navigation` payload standalone (strict JSON):

```json
{
  "title": "E2E tenant",
  "defaultUrl": "e2e-orderslist",
  "items": [
    {
      "type": "page",
      "options": {
        "page": "e2e-orderslist",
        "url": "e2e-orderslist",
        "caption": "Orders"
      }
    },
    {
      "type": "group",
      "options": {
        "caption": "Master data",
        "icon": "icon-settings"
      },
      "items": [
        {
          "type": "page",
          "options": {
            "page": "e2e-customers",
            "url": "e2e-customers",
            "caption": "Customers"
          }
        }
      ]
    },
    {
      "type": "section",
      "items": [
        {
          "type": "page",
          "options": {
            "page": "e2e-reports",
            "url": "e2e-reports",
            "caption": "Reports",
            "icon": "icon-print"
          }
        }
      ]
    }
  ]
}
```

The `RightsCheckScript` above mirrors the minimal default: it grants a right if the string appears in the user's assigned rights. It is a function body; the client invokes it with `(userinfo, right)` (see [scripting.md](scripting.md)).

> The backend tolerates JSON5 in payload strings (the fixture `fixtures/e2e/tenant/e2e.json` uses unquoted keys); this reference always uses strict JSON.

See also: `fixtures/e2e/tenant/e2e.json` (runnable fixture) and [entities-and-crud.md](entities-and-crud.md) for the entity rights strings a page's content may additionally require.
