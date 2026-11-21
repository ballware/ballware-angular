# Ballware

**Ballware** is an open-source, metadata-driven application framework for building business applications. Business apps are not hand-coded in the frontend: they are described as **metadata** (entities, pages, documents, tenants, rights) served by a Ballware backend, and the included **webclient** shell interprets this metadata at runtime and renders full-featured user interfaces using [DevExtreme](https://devexpress.com) components.

The workspace is an [Nx](https://nx.dev) monorepo containing the webclient application and a set of publishable `@ballware/*` Angular libraries that implement the metadata model, backend API contracts, stateful services, runtime UI renderer, and client-side scripting hooks.

- License: MIT
- Package: `ballware` (see `package.json`), libraries published under the `@ballware` npm scope

---

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Modeling Applications with Metadata](#modeling-applications-with-metadata)
- [Monorepo Layout](#monorepo-layout)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [CI / CD and Deployment](#ci--cd-and-deployment)

---

## Key Features

- **Metadata-driven UI** — business entities, pages, layouts, and rights are loaded from a metadata backend and rendered dynamically; no per-app frontend code is required.
- **Rich data presentation** — main entity data grids, detail grids, detail tree lists, lookup editors, statistics views, and dashboards built on DevExtreme.
- **Dynamic forms & CRUD** — metadata-driven edit forms with editor preparation/validation, master-detail editing, batch save, and import/export (ExcelJS).
- **Client-side scripting hooks** (`@ballware/meta-scripting`) — metadata-defined custom logic for layout preparation, editor events, value changing, item mapping, custom functions, and rights checks. Code editors (JavaScript/SQL) are provided in-app via CodeMirror.
- **Authentication & multi-tenancy** — OIDC / Keycloak integration with bearer-token handling, tenant and user claim mapping, and role/right enforcement.
- **Document & storage backends** — reporting/document integration (signon, designer, viewer endpoints), attachment management with file storage and upload.
- **Modern input capabilities** — barcode/QR scanning (ZXing), speech recognition input, Google Maps integration, rich text editing, date/time, number, boolean, and code editors.
- **Application shell** — navigation, header, account settings, documentation viewer, notifications/subscriptions, print support.
- **Internationalization** — `i18next` / `angular-i18next` with bundled German and English resources in the renderer.
- **PWA & SSR** — service worker for installable/offline operation and Angular 19 server-side rendering behind a Hono server with Auth.js (Keycloak provider).
- **Idle detection & responsive behavior** — session idle handling and responsive layout services.

---

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Angular 19 (standalone components, SCSS) |
| Build system | Nx 22 monorepo, Yarn 4 (Corepack), TypeScript 5.8 |
| UI component library | DevExtreme / devextreme-angular 24.2 (theme: `dx.material.blue.light`), Bootstrap 5 grid/utilities, Bootstrap Icons, Angular CDK |
| State management | NgRx 19 (store, effects, router-store, component-store, devtools) |
| Reactive layer | RxJS 7 |
| Identity | OpenID Connect / Keycloak (`angular-oauth2-oidc`, `openid-client`, `@auth/core`, `@hono/oidc-auth`) |
| SSR | `@angular/ssr` with a [Hono](https://hono.dev) server (`apps/webclient/src/ssr.server.ts`) |
| Code editing | CodeMirror 6 (JavaScript, SQL, JSON5) |
| i18n | i18next / angular-i18next |
| Unit tests | Jest (via `@nx/jest`, `jest-preset-angular`), Storybook 9 + Playwright test-runner for renderer component tests |
| E2E tests | Cypress (`apps/webclient-e2e`) |
| Packaging | Publishable libraries via `ng-packagr`, Docker multi-stage builds, nginx serving |
| Quality | ESLint + Prettier, SonarCloud |

---

## Architecture

Ballware follows a strict **contract → adapter → service → renderer** layering. The shell wires everything together with Angular providers and injection tokens, so each layer can be replaced independently.

```
metadata backend (REST)
        ▲
        │ contracts (InjectionTokens)
 meta-api ─────────────── abstract API interfaces (entities, pages, documents,
        │                  users, tenants, lookups, notifications, statistics …)
        │
 rest-meta-api ─────────── REST adapters implementing the contracts against
        │                  Ballware backend endpoints (entity CRUD/save/query,
        │                  lookups, generic queries, Keycloak identity, tenant,
        │                  document, ML, storage services)
        │
 meta-services / ngrx-meta-services ─── stateful Angular services (CRUD, edit
        │                  modes, lookups, pages, toolbar, identity, tenant,
        │                  settings, statistics, attachments, notifications,
        │                  idle & responsive behavior); NgRx-backed implementations
        │                  live in ngrx-meta-services
        │
 dx-renderer ───────────── runtime renderer: interprets compiled metadata
        │                  (meta-model) and builds DevExtreme-powered screens —
        │                  grids, forms, editors, popups, tabs, navigation, shell
        │
 meta-scripting ────────── pure functional client-side hooks invoked by metadata
        │                  (preparegridlayout, prepareeditlayout, editor events,
        │                  evaluatecustomfunction, rightscheck …)
        │
 webclient ─────────────── application shell: routes, OIDC auth, interceptors,
                          provider wiring, PWA + SSR hosts
```

- **`@ballware/meta-model`** defines the compiled metadata model (`CompiledEntityMetadata`, pages, documents, templates, rights, query parameters) shared by all layers.
- **`@ballware/meta-api`** defines provider contracts as Angular `InjectionToken`s (e.g. `META_ENTITY_API`), keeping the shell backend-agnostic.
- **`@ballware/rest-meta-api`** binds those contracts to the concrete Ballware REST endpoints at runtime (see the provider factories in `apps/webclient/src/app/app.config.ts`).
- **`@ballware/dx-renderer`** contains a component registry that maps metadata item types to DevExtreme-based components (list/edit/detail views) and the application shell components.
- **`@ballware/renderer-commons`** provides shared renderer directives and speech recognition services.
- The webclient exposes three hosts sharing one `sharedConfig`: **static SPA** (`main.static.ts`, served by nginx), **SSR** (`main.server.ts` + `ssr.server.ts` with Hono and Auth.js), and an OIDC-protected middleware (`src/middleware`, `src/auth`).

---

## Modeling Applications with Metadata

Business apps are described entirely in metadata served by the Ballware metadata backend. The **[metadata reference](docs/metadata/README.md)** documents the raw metadata JSON envelope as consumed by this webclient — the entity, page, tenant, and statistic envelopes, grid and edit layouts, custom functions, statistics, and the `CustomScripts` hooks — with option tables and strict-JSON examples, written so that both humans and AI assistants can author metadata.

| Topic | Reference |
|---|---|
| Navigation & tenant metadata | [docs/metadata/navigation.md](docs/metadata/navigation.md) |
| Entities, CRUD, lookups, rights | [docs/metadata/entities-and-crud.md](docs/metadata/entities-and-crud.md) |
| Grid (list) layouts & columns | [docs/metadata/lists.md](docs/metadata/lists.md) |
| Edit layouts, editors, templates | [docs/metadata/edit-forms.md](docs/metadata/edit-forms.md) |
| Custom functions | [docs/metadata/custom-functions.md](docs/metadata/custom-functions.md) |
| Statistics (chart / map / pivot) | [docs/metadata/statistics.md](docs/metadata/statistics.md) |
| Custom scripts & `ScriptUtil` | [docs/metadata/scripting.md](docs/metadata/scripting.md) |

Runnable example envelopes live in [`fixtures/e2e/`](fixtures/e2e).

---

## Monorepo Layout

```
apps/
  webclient/               Angular application shell (default project)
  webclient-e2e/           Cypress end-to-end tests
  storybook-prototyping/   Storybook prototypes and fixtures
libs/
  meta-api/                Backend API contracts (interfaces + injection tokens)
  meta-model/              Compiled metadata model
  rest-meta-api/           REST adapters for the Ballware backend
  meta-services/           Core Angular meta services
  common-meta-services/    Shared services (idle, interaction, responsive)
  ngrx-meta-services/      NgRx-based meta service implementations
  renderer-commons/        Shared renderer directives & speech recognition
  dx-renderer/             DevExtreme runtime renderer + application shell
  meta-scripting/          Metadata-invoked client-side scripting hooks
```

Run `nx graph` to visualize the project dependency graph.

---

## Configuration

Runtime configuration is injected into `index.html` placeholders and resolved at container startup. The Docker entrypoint collects all `BALLWARE_*` environment variables into a JSON object assigned to `window.ENV`, which the app reads through the `ENV` injection token (`apps/webclient/src/app/env.ts`).

| Variable | Purpose |
|---|---|
| `BALLWARE_BASEURL` | Public base URL of the application |
| `BALLWARE_VERSION` | Version label shown by the app |
| `BALLWARE_METAURL` | Metadata service base URL |
| `BALLWARE_TENANTURL` | Tenant management service base URL |
| `BALLWARE_GENERICURL` | Generic query endpoint base URL |
| `BALLWARE_DOCUMENTURL` | Document/reporting backend base URL |
| `BALLWARE_DOCUMENT_SIGNON_URL` | Document backend sign-on URL |
| `BALLWARE_DOCUMENT_DESIGNER_URL` | Report designer URL |
| `BALLWARE_DOCUMENT_VIEWER_URL` | Report viewer URL |
| `BALLWARE_STORAGEURL` | Attachment/file storage service base URL |
| `BALLWARE_MLURL` | Machine learning service base URL |
| `BALLWARE_IDENTITYURL` | Keycloak/OIDC issuer URL |
| `BALLWARE_CLIENTID` | OIDC client id |
| `BALLWARE_CLIENTSECRET` | OIDC client secret (server-side) |
| `BALLWARE_IDENTITYSCOPES` | OIDC scopes to request |
| `BALLWARE_IDENTITYAUTOREFRESH` | Enable automatic token refresh |
| `BALLWARE_TENANTCLAIM` | JWT claim used for tenant resolution |
| `BALLWARE_USERNAMECLAIM` | JWT claim used for user name |
| `BALLWARE_ACCOUNTURL` | External account management portal |
| `BALLWARE_GOOGLEKEY` | Google Maps API key |
| `BALLWARE_DEVEXTREMEKEY` | DevExtreme license key |

Build-time configuration uses Angular `fileReplacements`: `environment.ts` is replaced by `environment.dev.ts` (development) or `environment.prod.ts` (production, enables the service worker). An on-prem variant can be generated with `nx run webclient:collect-vars`.

For local development the dev server runs **HTTPS on port 3000** (`host 0.0.0.0`) with the self-signed certificates `localhost+2.pem` / `localhost+2-key.pem` in the repository root.

---

## Development

Prerequisites: Node.js **20.19.5** (see `.nvmrc`) and Yarn 4 (enabled automatically via Corepack; `yarnPath` is pinned in `.yarnrc.yml`).

```sh
yarn install                 # install dependencies (immutable lockfile)

nx serve webclient           # dev server → https://localhost:3000
nx serve-ssr                 # SSR dev server via Hono
nx build --configuration=production   # production build (static output)
nx run webclient:server      # build SSR server bundle
nx graph                     # dependency graph of the workspace
nx storybook dx-renderer     # component explorer for the renderer
```

`nx` is aliased to `ng` through `decorate-angular-cli.js`, so `ng serve`, `ng build`, etc. also work.

---

## Testing

```sh
yarn test                          # all unit tests (Jest, JUnit + lcov output)
nx test <project>                  # unit tests for one project
nx test-storybook dx-renderer      # Playwright tests against Storybook stories
nx e2e webclient-e2e               # Cypress end-to-end tests
```

The renderer library has an extensive Storybook suite used both for visual development and automated component testing (see `libs/dx-renderer/STORYBOOK_TESTING.md`).

---

## CI / CD and Deployment

GitHub Actions workflows (`.github/workflows`):

- **`docker-tests.yml`** — on pushes to `main`, `develop`, `feature/*`, `bugfix/*`: Jest unit tests with coverage, Storybook build + Playwright story tests, coverage merge, SonarCloud analysis.
- **`docker-latest.yml`** — builds and pushes the `:latest` image to GitHub Container Registry on `main`.
- **`docker-release.yml`** — on `v*.*.*` tags, builds multi-platform images (`linux/amd64`, `linux/arm64`) and pushes them to `ghcr.io/ballware/ballware-angular:<tag>`.

The application ships as a multi-stage Docker image (`apps/webclient/Dockerfile`):

1. `deps` — dependency installation with Yarn 4 (cached layer).
2. `build` — `yarn nx build --configuration=production`.
3. `final` — `nginx:stable-alpine` serving the static bundle with SPA fallback (`try_files … /index.html`); the entrypoint injects `BALLWARE_*` environment variables into the served `index.html`, making the same image configurable per deployment.

---

## License

MIT — see [LICENSE](LICENSE).
