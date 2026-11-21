# Statistics

Statistics are standalone metadata documents rendered as **chart**, **map**, or **pivot grid**. They are embedded in pages or edit forms via a `statistic` layout item and resolved by their `Identifier`.

Compiled model source: `libs/meta-model/src/lib/statistic.ts`. Renderer: `libs/dx-renderer/src/lib/components/statistic/`.

## Envelope

- Metadata: `GET {meta}/statistic/metadataforidentifier/{identifier}`
- Data: `GET {tenant-service}/statistic/dataforidentifier/{identifier}?<headParams>` — the query string carries the **head params** of the embedding page (`libs/rest-meta-api/src/lib/statistic.ts:47-67`)

Raw envelope (`libs/rest-meta-api/src/lib/statistic.ts:11-19`):

| Field | Type | Required | Description |
|---|---|---|---|
| `Id` | string | yes | Backend storage row id |
| `Entity` | string | no | Storage-side classification; **never read by the client** |
| `Identifier` | string | yes | Lookup key the embedding item references and the data endpoint is called with |
| `Name` | string | yes | Fallback display name (used when the layout has no `title`) |
| `Layout` | JSON string | yes | `StatisticLayout`, see below |
| `MappingScript` | script string | no | Data preparation hook (see [scripting.md](scripting.md)) |
| `CustomScripts` | JSON string | no | `{ argumentAxisCustomizeText }` (see [scripting.md](scripting.md)) |

The data request fires **once**, when metadata, custom param, head params, and lookups of the embedding context are all present (`libs/ngrx-meta-services/src/lib/statistic/statistic.store.ts:60-65`). It is called with the envelope's `Identifier`.

## StatisticLayout schema

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"chart"` \| `"map"` \| `"pivot"` | yes | Selects the renderer component (`statistic/page/pagestatistic.component.html:1-3`: `chart` → `ballware-statistic-chart`, `map` → `ballware-statistic-map`, `pivot` → `ballware-statistic-pivotgrid`) |
| `title` | string | no | Headline; the rendered statistic is named `layout.title ?? Name` |
| `height` | string | no | Component height, default `"100%"` |
| `options` | type-specific object | yes | See option tables below |

Data rows are plain objects (`Array<Record<string, unknown>>`); `argumentField`, `valueField`, `locationField`, `tooltipField`, and pivot `dataField` reference properties of these rows.

### Chart options (`type: "chart"`)

| Option | Type | Required | Description |
|---|---|---|---|
| `argumentField` | string | yes | Data property used as chart argument |
| `rotated` | boolean | no | Horizontal bars |
| `argumentAxis.argumentType` | `"datetime"` \| `"numeric"` \| `"string"` | no | Argument data type |
| `argumentAxis.visualRangeFrom` / `visualRangeTo` | number | no | Fixed visual range |
| `argumentAxis.tickInterval` | `{ days?, hours?, milliseconds?, minutes?, months?, quarters?, seconds?, weeks?, years? }` | no | Tick interval |
| `argumentAxis.lines` / `valueAxis.lines` | `Array<{ value, color, dashStyle, labelText? }>` | no | Constant lines; `dashStyle`: `"dash"` \| `"dot"` \| `"longDash"` \| `"solid"` |
| `legend` | `{ title?, horizontalAlignment?, verticalAlignment? }` | no | `horizontalAlignment`: `"center"` \| `"left"` \| `"right"`; `verticalAlignment`: `"bottom"` \| `"top"` |
| `series` | `Array<{ type, name, valueField, visible?, labelVisible?, format?, precision? }>` | yes | `type`: `"bar"` \| `"line"`; `format` is a DevExtreme format name (e.g. `"currency"`, `"percent"`, `"fixedPoint"`); `precision` for numeric values |

### Map options (`type: "map"`)

| Option | Type | Required | Description |
|---|---|---|---|
| `locationField` | string | yes | Data property containing the location |
| `tooltipField` | string | yes | Data property containing tooltip text |

### Pivot options (`type: "pivot"`)

| Option | Type | Required | Description |
|---|---|---|---|
| `showRowTotals` | boolean | no | Summary values per hierarchy level |
| `showRowGrandTotals` | boolean | no | Grand totals |
| `fields` | `Array<{ caption, dataField, area?, dataType?, groupInterval?, summaryType?, expanded?, showTotals?, showGrandTotals?, format?, precision?, width? }>` | yes | `area`: `"row"` \| `"column"` \| `"data"`; `dataType`: `"date"` \| `"number"` \| `"string"`; `groupInterval`: `"day"` \| `"dayOfWeek"` \| `"month"` \| `"quarter"` \| `"year"`; `summaryType`: `"avg"` \| `"count"` \| `"custom"` \| `"max"` \| `"min"` \| `"sum"`; `format` as for chart series |

## Scripts

- `MappingScript(data, layout, customParam, params, lookups, util, callback)` runs on every data load and **must** call `callback(layout, data)` — omitting it renders nothing. Default: `callback(layout, data)`.
- `CustomScripts.argumentAxisCustomizeText(layout, value, params, customParam, util)` customizes chart argument-axis labels; returning `undefined` falls back to the raw value (`libs/dx-renderer/src/lib/statistic/chart/chart.component.ts:55-58`). Applies to **charts only**.

Details in [scripting.md](scripting.md).

## Embedding in a page

Page item `type: "statistic"` (`libs/dx-renderer/src/lib/components/index.ts:71`):

```json
{
  "type": "statistic",
  "options": {
    "itemoptions": { "statistic": "demoorder-status" }
  }
}
```

- `itemoptions.statistic` is the statistic `Identifier` (`pagestatistic.component.ts:70-78`). Head params come from the **embedding page's head params** (e.g. toolbar `actions.loadData(...)` params), custom param from the page's `prepareCustomParam` result.
- `StatisticOptions.params` and `StatisticOptions.identifier` are declared in the model (`libs/meta-model/src/lib/page.ts:185-200`) but **never read** by the page component.

## Embedding in an edit form

Edit item `type: "statistic"` (`libs/dx-renderer/src/lib/components/index.ts:110`):

```json
{
  "type": "statistic",
  "options": {
    "itemoptions": {
      "identifier": "demoorder-positions",
      "params": { "orderId": "o1" }
    }
  }
}
```

- The edit component uses **`identifier`** (not `statistic`) plus optional static `params` (`editstatistic.component.ts:63-69`); custom param comes from the entity's `prepareCustomParam`.

## Example

Raw envelope with a chart layout (payloads embedded as escaped strings):

```json
{
  "Id": "demoorder-status",
  "Entity": "demoorder",
  "Identifier": "demoorder-status",
  "Name": "Orders by status",
  "Layout": "{\"type\":\"chart\",\"title\":\"Orders by status\",\"height\":\"100%\",\"options\":{\"argumentField\":\"Status\",\"argumentAxis\":{\"argumentType\":\"string\"},\"series\":[{\"type\":\"bar\",\"name\":\"Orders\",\"valueField\":\"Total\",\"labelVisible\":true,\"format\":\"fixedPoint\"}]}}",
  "MappingScript": "callback(layout, data.filter(row => row.Total > 0));",
  "CustomScripts": "{\"argumentAxisCustomizeText\":\"return value == 'open' ? 'Open' : 'Closed';\"}"
}
```

## Caveats (verified against source)

- The page embedding key is `itemoptions.statistic`; the **edit** embedding key is `itemoptions.identifier` — the two differ.
- `Entity` and `Id` in the envelope are storage fields; the client only uses `Identifier`, `Name`, `Layout`, `MappingScript`, `CustomScripts`.
- Data is fetched with the **envelope `Identifier`** — `itemoptions.statistic` / `itemoptions.identifier` must match it exactly.
- Pivot `summaryType: "custom"` has no metadata-side implementation hook here; it is passed through to the DevExtreme pivot grid.
- No statistic fixture exists in `fixtures/e2e/` — the example above is the reference shape.
- The axis customize hook affects the chart argument axis only; map/pivot renderers never call it.
