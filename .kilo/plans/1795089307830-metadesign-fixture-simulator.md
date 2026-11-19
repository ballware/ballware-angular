# MetaDesign-Sandbox + Playwright-e2e-fähiger Meta-Designer

## 1. Ziel & Abgrenzung

**Schritt 1 (dieser Plan):** eine eigenständige Nx-App `apps/metadesign`, die den echten UI-Layer
(`@ballware/dx-renderer`, `@ballware/renderer-commons`, `@ballware/ngrx-meta-services`) gegen eine
lokal simulierte Meta-/Generic-/Tenant-API betreibt. Metadaten kommen aus einem konfigurierbaren
Quellverzeichnis im Format von `ballware-fwpro`. Designer-Änderungen liegen als Overlay über den
Exporten. Daten + Backend-Verhalten werden über Fixtures und skriptierbare `.mjs`-Handler simuliert.

Der MetaDesigner wird **direkt Playwright-e2e-testfähig** implementiert. Der vorhandene
Breadcrumb-Mechanismus wird dafür minimal erweitert, sodass der dynamische Widget-Baum generisch
nutzbare `data-testid`-Anker bekommt.

**Out of scope (Schritt 2):** eigentlicher Metadaten-Editor im UI (Overlay-Editor-Panel,
Validierung/Schema, Round-Trip zurück ins Backend), Chromatic/visuelle Regression, Production-Docker.

**Libs dürfen minimal angetastet werden:** `libs/renderer-commons` und `libs/dx-renderer` für den
generellen Test-Mechanismus. Nicht angetastet: `libs/meta-*`, `libs/rest-meta-api`,
`libs/dx-renderer/.storybook/*`.

## 2. Getroffene Entscheidungen

| Thema | Entscheidung |
|---|---|
| Harness | Standalone-Nx-App `apps/metadesign` + Fixture-Middleware, kein echtes Backend |
| E2E | Dediziertes Playwright-Projekt `apps/metadesign-e2e`; bestehender Cypress-Webclient-E2E bleibt unberührt |
| Test-IDs | Extend vorhandener `Breadcrumb`-Mechanismus; `data-testid` bleibt die Basis |
| Layout-Wrapper | `ballware-page-item` und `ballware-edit-item` bekommen Host-`Breadcrumb` und stabile, hierarchische IDs |
| Toolbar | `ballware-toolbar` bekommt Breadcrumb-Root; Toolbar-Widgets erhalten `elementAttr`-`data-testid` |
| Overlay | In-Memory-Overlay über Exporten; `POST /designer/overlay/...` aktiv für Fixture/E2E; UI-Overlay-Editor optional |
| Zustand | Dev-Server-Middleware mit `/designer/reset` für deterministische Playwright-Läufe |
| Seed | `fixtures/e2e` deterministischer Mini-Tenant für Playwright; `fixtures/demo` optional; `../ballware-fwpro` lokal |
| CI | `lint` + `test` ja; Playwright als separates Target, ohne Docker-/Production-Pipeline |
| Config | `ENV`-Token + Umgebungsvariablen, lokale Prefixe `/meta`, `/generic`, `/tenant`, `/document`, `/identity`, `/ml`, `/storage`, `/designer` |

## 3. Tragende Code-Fakten

- `compileEntityMetadata`/`compilePage` sind clientseitig und öffentlich aus `@ballware/rest-meta-api` exportiert
  (`libs/rest-meta-api/src/lib/index.ts`, `libs/rest-meta-api/src/lib/entity.ts`).
- `ballware-fwpro`-Exporte entsprechen dem Wire-Typ `EntityMetadata`/`PageMetadata`; JSON5-Felder sind Strings.
- Custom-Scripts laufen clientseitig über `meta-scripting` (`libs/meta-scripting/src/lib/entity/itemmapping.ts`).
- Identity kann ohne Keycloak simuliert werden:
  `provideNgrxStaticUserIdentityService(user, tenant, userName)`
  (`libs/ngrx-meta-services/src/lib/index.ts`, `identity/identity.staticuser.proxy.ts`).
- Renderer-Routing ist vorhanden: `page/:id`, `print`, `**` (`libs/dx-renderer/src/lib/index.ts`).
- REST-URL-Contract ist in `libs/rest-meta-api` definiert und muss durch die Fixture-Middleware bedient werden.
- `Breadcrumb` erzeugt bereits `data-testid` als `pathString`
  (`libs/renderer-commons/src/lib/directives/breadcrumb.ts`).
- Der Mechanismus ist aber noch nicht vollständig generisch, weil die dynamischen Layout-Wrapper
  `ballware-page-item` und `ballware-edit-item` keine eigenen stabilen Breadcrumb-Knoten sind.
- DevExtreme-Widgets unterstützen `elementAttr` für Containerattribute; Toolbar-Widgets können damit
  Playwright-testbar gemacht werden.

## 4. Architektur

```
apps/metadesign (nx serve, Port 4300, kein SSL/SSR/PWA)
  app.config.ts = Provider-Kette wie apps/webclient/src/app/app.config.ts,
                  Base-URLs lokal (/meta,/generic,/tenant,/document,/identity,/ml,/storage)
                  + provideNgrxStaticUserIdentityService(...)
        │ HttpClient (unveränderte rest-meta-api-Adapter)
        ▼
Vite-/Nx-Dev-Server-Middleware tools/fixture-middleware
        │ Overlay, Data-Store, .mjs-Handler, /designer/bootstrap, /designer/reset, /designer/revision
        ▼
<fixture-root>/  (Default: ./fixtures, optional ../ballware-fwpro)

apps/metadesign-e2e (Playwright)
        │ nx e2e metadesign-e2e
        └─> baseURL http://localhost:4300, data-testid via Breadcrumb-IDs
```

## 5. Testidentifier-Vertrag

### 5.1 Breadcrumb-Erweiterung in `libs/renderer-commons`

Datei: `libs/renderer-commons/src/lib/directives/breadcrumb.ts`

- Bestehende Semantik behalten: `data-testid` = `pathString`.
- Optional ergänzen:
  - `data-test-path` = `pathString`
  - `data-test-identifier` = `identifier`
- `setIdentifier(...)` bleibt der Weg, um semantische Identifier zu setzen.

Datei: `libs/renderer-commons/src/lib/testidentifiers.ts`

Exportierte, pure Helpers:

```ts
export const safeTestIdSegment = (value: unknown, fallback: string): string => ...
export const getPageItemTestIdSegment = (item: PageLayoutItem | undefined, index: number): string => ...
export const getEditItemTestIdSegment = (item: EditLayoutItem | undefined, index: number): string => ...
export const getToolbarItemTestId = (parentPath: string, name: unknown): string => ...
```

Segmentregeln:

- PageItem-Key bevorzugt:
  `itemoptions.identifier` → `itemoptions.entity` → `itemoptions.statistic` → `itemoptions.caption` → `type`
- EditItem-Key bevorzugt:
  `options.dataMember` → `itemoptions.identifier` → `options.caption` → `type`
- Index wird angehängt: `<key>-<index>`.
- Nicht-alphanumerische Zeichen werden zu `_` normalisiert; leere Keys fallen auf Fallback zurück.

### 5.2 `dx-renderer` Layout-Wrapper mit Host-Breadcrumb

`PageLayoutItemComponent`:

- `hostDirectives: [Breadcrumb]` ergänzen.
- `@Input() itemIndex?: number` ergänzen.
- In `ngOnInit()` vor dynamischer Widget-Erzeugung:
  `breadcrumb.setIdentifier(getPageItemTestIdSegment(layoutItem, itemIndex ?? 0))`.

`EditLayoutItemComponent`:

- `hostDirectives: [Breadcrumb]` ergänzen.
- `@Input() itemIndex?: number` ergänzen.
- In `ngOnInit()` vor dynamischer Widget-Erzeugung:
  `breadcrumb.setIdentifier(getEditItemTestIdSegment(layoutItem, itemIndex ?? 0))`.

Templates müssen Index durchreichen:

- `libs/dx-renderer/src/lib/components/layout/page/layout.component.html`
- `libs/dx-renderer/src/lib/components/tabs/page/tabs.component.html`
- `libs/dx-renderer/src/lib/components/crudcontainer/page/pagecrudcontainer.component.html`
- `libs/dx-renderer/src/lib/components/layout/edit/container.component.html`

### 5.3 Toolbar-Test-IDs

`ToolbarComponent` (`libs/dx-renderer/src/lib/toolbar/toolbar/toolbar.component.ts`):

- `hostDirectives: [Breadcrumb]` ergänzen.
- Identifier `toolbar` setzen.
- `Breadcrumb` in `ToolbarComponent` injizieren und in ToolbarItem-Factory-Kontext nutzen.

ToolbarItem-Factories in `libs/dx-renderer/src/lib/components/*/toolbaritem.ts`:

- `options.elementAttr` ergänzen:

```ts
{
  'data-testid': getToolbarItemTestId(inject(Breadcrumb).pathString, item.name ?? item.caption),
  'data-test-toolbar-name': item.name
}
```

### 5.4 DataGrid-Container

In `libs/dx-renderer/src/lib/datacontainer/datagrid/datagrid.component.html` optional ergänzen:

```html
[elementAttr]="{ class: 'w-100', 'data-test-widget': 'datagrid', 'data-test-grid-layout': layout?.identifier ?? 'primary' }"
```

In Grid-Column-Factories optional:

```ts
name: c.dataMember ?? c.caption
```

Keine `headerCellTemplate`/`cellTemplate` erzwingen; Header zunächst über Caption/`columnheader`-Role und
Wrapper-`data-testid` testen.

### 5.5 Playwright-Locator-Muster

- Page-Root: `getByTestId(pageId)`
- Page-Layout-Item: `getByTestId(`${pageId}.layout.<key>-<index>`)`
- Edit-Layout-Item: `getByTestId(`${pageId}.dialog.edit.<key>-<index>`)`
- Toolbar: `getByTestId(`${pageId}.toolbar`)`
- Toolbar-Widget: `getByTestId(`${pageId}.toolbar.<name>`)`
- Grid-Container: `getByTestId(pageLayoutTestId).locator('[data-test-widget="datagrid"]')`
- Grid-Rows: Wrapper-Locator + `.dx-datagrid-rowsview .dx-row`

`playwright.config.ts` muss `testIdAttribute: 'data-testid'` setzen, damit `getByTestId(...)` direkt funktioniert.

## 6. Fixture-Verzeichnis

```
<fixture-root>/
  tenant/<name>.json
  entity/<entity>.json
  page/<identifier>.json
  document|statistic|...
  data/<application>/<entity>.json
  lookup/<identifier>.json
  pickvalue/<application>.<field>.json
  simulation/<application>/<entity>.mjs
  designer/overlay/entity/<entity>.json5
  designer/overlay/page/<identifier>.json5
  designer/overlay/tenant/<tenant>.json5
  identity/user.json
```

E2E-Fixtures:

```
fixtures/e2e/
  identity/e2e-user.json
  identity/e2e-user-no-rights.json
  tenant/e2e.json
  entity/demoorder.json
  page/e2e-orderslist.json
  data/<application>/demoorder.json
  lookup/e2estatus.json
  simulation/<application>/demoorder.mjs
```

Regeln: nur Pfade unterhalb eines Allowlist-Roots; `path.resolve` + `startsWith`; Cache mit Mtime; unbekannte Export-Felder durchreichen.

## 7. Middleware-Endpoints

Renderer-Contract:

- `GET {meta}/entity/metadataforentity/{entity}`
- `GET {meta}/entity/selectlist|selectbyid/{id}|selectlistrights|rightselectbyid/{id}`
- `GET {meta}/page/pagedataforidentifier/{page}|selectlist|selectbyid/{id}`
- Tenant-Endpoints
- Lookup-/Pickvalue-/Processingstate-/Document-Stubs
- `{generic}/{application}/{entity}/all|query|count|byId|new|save|savebatch|remove/{id}`
- `{identity}/ballware-user-api/selectlist|selectbyid/{id}|tenant?tenant=`

Sandbox-/Designer-Endpoints:

- `GET /designer/bootstrap` → Tenant + User-Fixture + Revision
- `GET /designer/roots`
- `GET /designer/tenants`
- `GET /designer/revision`
- `GET|POST /designer/overlay/{kind}/{id}` → Overlay-In-Memory-Store, optional Persistenz
- `POST /designer/reset` → Discard In-Memory-Overlay/Data-Änderungen, Reload Base-Fixtures
- optional `GET /designer/e2e/selectors?tenant=...&page=...` → deterministische Playwright-Test-ID-Karten

## 8. Umsetzung

### Welle A – Generischer Test-Mechanismus

1. `libs/renderer-commons/src/lib/testidentifiers.ts` anlegen und in `libs/renderer-commons/src/lib/directives/index.ts` oder `libs/renderer-commons/src/lib/index.ts` exportieren.
2. `Breadcrumb` minimal erweitern: zusätzlich `data-test-path` und `data-test-identifier`.
3. `PageLayoutItemComponent` und `EditLayoutItemComponent` Host-`Breadcrumb` + `itemIndex` ergänzen.
4. Layout-/Tabs-/Crudcontainer-/Edit-Container-Templates mit `itemIndex` aktualisieren.
5. `ToolbarComponent` Host-`Breadcrumb` ergänzen und Toolbar-Item-Factories mit `elementAttr` ausstatten.
6. Optional `DatagridComponent` mit `elementAttr`/`data-test-grid-layout` ergänzen.
7. Unit-Tests:
   - `libs/renderer-commons/src/lib/testidentifiers.spec.ts`
   - `libs/dx-renderer/src/lib/components/layout/page/item.component.spec.ts`
   - `libs/dx-renderer/src/lib/components/layout/edit/item.component.spec.ts`
   - vorhandene `dx-renderer`-Tests anpassen, falls NgRx-Store-Identifiers (`breadcrumb.pathString`) sich verändern.

### Welle B – Fixture-Middleware

8. `tools/fixture-middleware/src/fixture-middleware.ts` als Default-Export `(req, res, next)`.
9. `src/config.ts` mit `BALLWARE_FIXTURE_ROOTS`, `BALLWARE_FIXTURE_TENANT`, `BALLWARE_FIXTURE_PERSIST`, `BALLWARE_FIXTURE_ALLOW_OVERLAY_WRITE`.
10. `src/loader.ts` für Export-Entpacken, JSON5, Mtime-Cache, Pfadschutz.
11. `src/overlay.ts` für Deep-Merge; Overlay standardmäßig In-Memory, Persistenz optional.
12. `src/store.ts` für Generic-Entity-CRUD: `all/query/count/byId/new/save/saveBatch/remove`.
13. `src/handlers.ts` für `.mjs`-Simulation-Handler.
14. `src/designer.ts` für bootstrap/roots/tenants/overlay/revision/reset.
15. Jest-Tests: Overlay-Merge, Pfadschutz, Store-CRUD, Handler-Delegation, Reset, Round-Trip mit einem im Repo abgelegten `person.json`-Sample → `compileEntityMetadata` ohne Fehler.

### Welle C – Sandbox-App

16. `apps/metadesign` erzeugen: esbuild-basiert, Port 4300, ohne SSR/PWA/SSL/Container.
17. `app.config.ts` mit lokalen REST-Base-Prefixen und Renderer-Providern.
18. `main.ts` lädt zuerst `/designer/bootstrap` und bootet danach mit
    `provideNgrxStaticUserIdentityService(user, tenant, userName)`.
19. Header/Umschaltung: Tenant + User über `location.search` oder Select.
20. Read-only-Inspektor in `apps/metadesign/src/app/inspector/**` mit kompilierten Metadaten,
    Overlay-Herkunft, Rights-Matrix und Request-Log.
21. `fixtures/demo/**` optional für lokale Demos.

### Welle D – Playwright-E2E

22. Dev-Dependencies installieren:

```bash
yarn add -D @nx/playwright@22.0.3 @playwright/test@1.56.1
yarn playwright install chromium
```

23. Playwright-Projekt erzeugen:

```bash
nx g @nx/playwright:application apps/metadesign-e2e --appProject=metadesign
```

Fallback, falls Generator/Executor in Nx 22 abweicht: manuell `apps/metadesign-e2e/project.json`
mit einem E2E-Target anlegen; als Playwright-Fallback `webServer` mit
`npx nx serve metadesign --port 4300` konfigurieren.

24. `apps/metadesign-e2e/playwright.config.ts`:
   - `testIdAttribute: 'data-testid'`
   - `baseURL: process.env.METADESIGN_E2E_URL ?? 'http://localhost:4300'`
   - `fullyParallel: false`
   - `workers: 1` für mutable Fixture-Store
   - Reporter HTML
   - `webServer` optional nur im Fallback-Modus
   - Umgebungsvariablen für E2E-Fixture-Root/Tenant setzen:
     `BALLWARE_FIXTURE_ROOTS=./fixtures`, `BALLWARE_FIXTURE_TENANT=e2e`

25. E2E-Supportdateien:
   - `apps/metadesign-e2e/src/support/designer-api.ts` für `/designer/bootstrap`, `/designer/reset`, `/designer/revision`, Overlay-POST
   - `apps/metadesign-e2e/src/support/testids.ts` für Locator-Helper
   - PageObjects für Orderslist/Edit/Inspector

26. Mindest-Szenarien:
   - Tenant/Identity/Navigation lädt mit `data-testid`-Page-Root.
   - User ohne Recht sieht Navigation/Buttons nicht; mit Recht schon.
   - Grid-Seite rendert Fixture-Zeilen und Grid-Wrapper-ID.
   - `prepareEditLayout`/`editorValueChanged` im Edit-Dialog wird über Edit-Item-IDs geprüft.
   - Lookup wird aus Fixture geöffnet und gewählt.
   - `save`/`remove` gegen Generic-Store aktualisiert UI und `/designer/reset` stellt Ausgangszustand wieder her.
   - Overlay-Änderung einer Spalten-Caption wird via Overlay-Endpoint + Reload getestet.
   - Inspektor zeigt Overlay-Herkunft und Rights-Matrix.

## 9. Fidelity-Gaps

- `ListQuery`/serverseitige SQL-Semantik wird nicht ausgeführt.
- Serverseitige `SaveScript`/`States` nur so weit wie Simulation-Handler.
- Dokumente/Print/Attachments/ML/Import/Export bleiben Stubs.
- Kein Keycloak/Auth-Flow, kein Production-SSR/PWA.
- DevExtreme-License-Key lokal optional (`BALLWARE_DEVEXTREMEKEY`); ohne Key nur Dev-Warning.

## 10. Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| `@nx/playwright` Generator/Executor unterscheidet sich in Nx 22 | Fallback: manuelles E2E-Target + Playwright `webServer` |
| Breadcrumb-Wrappers ändern NgRx-Component-State-Keys | Unit-/Renderer-Tests anpassen; Store-Keys bleiben nur innerhalb der App relevant |
| Toolbar-`elementAttr` bei DevExtreme-Version unsupported | Toolbar-Item-Factories mit Helper + Unit-Test; alternativ Button über accessible Name testen |
| Mutable Store macht Playwright-Tests flaky | `workers: 1`, `fullyParallel: false`, global `POST /designer/reset` |
| Overlay-POST verändert Fixture-Dateien | Overlay standardmäßig In-Memory; Disk-Persistenz nur explizit aktivieren |
| `data-testid`-IDs werden zu dynamisch | Helper erzwingen Index/Semantic-Key; PageObjects nutzen `/designer/e2e/selectors` optional |
| DevExtreme-Grid-Zellen schwer selektierbar | Wrapper-ID + Caption/Text/Row-Text; keine globalen Cell-Templates nötig |

## 11. Default-Annahmen für offene Punkte

1. Dokument-/Print-Funktionen in Schritt 1: Stub; Print erst später.
2. Statistik-Seiten: zunächst nicht simulieren.
3. DevExtreme-License-Key: über Env-Variable setzen, lokal ohne Key möglich.
4. Overlay-Write-Endpoint: middlewareseitig aktiv für Fixture/E2E, UI-Overlay-Editor optional/später.

## 12. Validierung

```bash
nx lint renderer-commons dx-renderer fixture-middleware metadesign metadesign-e2e
nx test renderer-commons
nx test dx-renderer
nx test fixture-middleware
nx test metadesign
nx run-many --target test
nx e2e metadesign-e2e
```

Manuelle UAT:

1. `nx serve metadesign` lädt `fixtures/e2e` oder `fixtures/demo`.
2. Page-/Grid-/Edit-/Toolbar-Elemente besitzen sichtbare `data-testid`-Attribute.
3. Playwright-Suite verwendet nur `getByTestId`, Rollen/Labels und stabile Fixture-Captions.
4. Cypress `webclient-e2e` bleibt unverändert grün, sofern Browser/DevServer im Projekt lauffähig sind.
