# pf-ecommerce-frontend

Storefront of a complete e-commerce platform (portfolio project). Angular 22 + RxJS + Tailwind CSS,
consuming the versioned HTTP API of `pf-ecommerce-backend` (`/api/v1`).

## Overview

This repository implements the customer-facing storefront: product discovery, cart, checkout, ordering,
payments, shipments, and account management. It mirrors the backend's bounded contexts as lazy frontend
slices, with one dependency rule: `features → core ← shared` (see `ai/ARCHITECTURE.md`).

Goals of this portfolio project:

- Show clean frontend architecture (feature-per-context, typed API contracts, signal + RxJS state).
- Show backend-contract fidelity (camelCase, cursor pagination, decimal-string money, Problem Details,
  `Idempotency-Key`, `If-Match`, `Accept-Language`).
- Show production-ready concerns: auth with rotating refresh tokens, correlation IDs, i18n-ready
  formatting, and container packaging.

## Tech Stack

| Concern         | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Angular 22 (standalone, zoneless, strict templates)     |
| State / streams | Signals + RxJS 7                                        |
| Styling         | Tailwind CSS 4                                          |
| Unit tests      | Vitest (`ng test --coverage`)                           |
| Lint / format   | ESLint (angular-eslint, warnings are errors) + Prettier |
| API docs        | Backend OpenAPI (`/api/v1/openapi/v1.json`, dev only)   |
| Packaging       | Docker (multi-stage, non-root nginx)                    |

## Bounded contexts (frontend slices)

Source lives under `src/app`, organized by bounded context (not by technical layer):

```
src/app/
├── core/          # singletons: api client, auth store/service/guards, interceptors, i18n, logging
├── shared/        # dumb UI (problem-errors, empty-state), pipes (money), utils (idempotency-key)
├── features/
│   ├── catalog/   # product discovery (implemented)
│   ├── identity/  # sign-in, registration (implemented)
│   ├── cart/      # mapped, not wired yet
│   ├── checkout/  # mapped, not wired yet
│   ├── ordering/  # mapped, not wired yet
│   └── ...        # billing, inventory, shipping, customers: mapped, not wired yet
└── shell in app.ts (header/nav/footer + outlet)
```

Each feature owns its models, service, and routed pages. Cross-feature imports are forbidden;
shared contracts live in `core/`.

## Prerequisites

- Node.js 24.16.0 (see `.nvmrc`; `engines` enforces it)
- npm 12.2.0 (`packageManager` enforces it)
- The backend API running (development default `http://localhost:5223/api/v1`)

## Getting Started

```bash
npm ci
npm start
```

The app is on `http://localhost:4200`. Development calls use same-origin `/api/v1` through
`proxy.conf.json` (target: backend Compose default `http://127.0.0.1:8080`, no CORS involved).
When the backend `.env` overrides `API_PORT`, point the proxy target at that port. Product reads are
anonymous; sign-in unlocks cart/orders.

Run the quality gates (same order as CI):

```bash
npm run format:check
npm run lint
npm run build:ci
npm run test:ci
npm audit --audit-level=high
```

## Configuration

Copy `.env.example` to `.env` for local notes. Angular bakes values at build time via
`src/environments/*`; secrets are never baked in and never committed.

| Setting           | Description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `apiBaseUrl`      | Versioned backend base URL (`/api/v1` in production via relative path)    |
| `defaultLocale`   | Default `Accept-Language` and formatting locale (`en`, `pt-BR` supported) |
| `PF_API_BASE_URL` | `.env` note for the dev value (`http://localhost:5223/api/v1`)            |

## Standards

Development standards live in `ai/` and are indexed by `AGENTS.md`:

- `ai/ARCHITECTURE.md` — slices, layers, routing, state, ADRs
- `ai/CODE.md` — TypeScript/Angular/RxJS rules, libraries, PR standards
- `ai/TESTS.md` — pyramid, Vitest patterns, coverage
- `ai/API_CONTRACTS.md` — consumer-side contract rules (pagination, money, errors, safeguards)
- `ai/SECURITY.md` — token handling, secrets, OWASP, logging redaction
- `ai/TASKS.md` — task checklist

Read the relevant document(s) before writing code, not after.

## API

The backend maps 35 versioned endpoints under `/api/v1` (see `../pf-ecommerce-backend/Portfolio.http`).
Implemented so far:

| Slice    | Routes / calls                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Catalog  | `GET /products` (search/sort/cursor pages), `GET /products/{id}`                                                             |
| Identity | `POST /auth/registrations`, `POST /auth/tokens`, `POST /auth/tokens/refresh`, `GET /auth/me`, `POST /auth/tokens/revocation` |
| Shell    | `/products`, `/products/:id`, `/sign-in`, `/register` (lazy)                                                                 |

Conventions honored: cursor pagination (`limit`, `cursor`), `Idempotency-Key` on unsafe retries,
`If-Match` preconditions, camelCase JSON with string enums, money as decimal strings, RFC 9457
Problem Details (clients branch on `code`, never on `message`), and default-deny routing
(`authGuard` + `requireLevel()`; anonymous routes opt out explicitly).

**Status:** public catalog discovery and the auth flow are implemented. Cart, checkout, ordering,
billing, inventory, shipping, and customers slices are mapped to routes rendering `NotImplemented`
(the frontend mirror of the backend's `501 ENDPOINT_NOT_IMPLEMENTED`) until their use cases land.

## Authentication and authorization

Short-lived bearer access tokens kept in memory only (never `localStorage`), rotating refresh tokens,
and five hierarchical access levels: **public**, **collaborator**, **manager**, **administrator**,
**developer**. Route guards name the minimum level; unauthorized staff see `/forbidden`.

## Containers

| Piece                            | File            |
| -------------------------------- | --------------- |
| Production image (build + nginx) | `Dockerfile`    |
| SPA fallback + cache policy      | `nginx.conf`    |
| Build context exclusions         | `.dockerignore` |

```bash
docker build --build-arg VERSION=1.0.0 --build-arg REVISION=$(git rev-parse HEAD) -t ecommerce-storefront:1.0.0 .
docker run --rm -p 8080:8080 ecommerce-storefront:1.0.0
```

The image serves hashed assets immutable for a year, `index.html` as `no-store`, and exposes
`GET /healthz` for probes. Base images are pinned by tag; pinning tag **and** digest via
Renovate/Dependabot is tracked as `TODO(frontend-infra)` in the Dockerfile.

## Quality Gates

Defined by `ai/CODE.md` and enforced locally and in `.github/workflows/ci.yml`:

- `.nvmrc` + `engines` + `packageManager` pin the toolchain; `package-lock.json` is committed and
  installed with `npm ci` (locked restore) in CI.
- `tsconfig` enables `strict`, `noUnusedLocals/Parameters`, `exactOptionalPropertyTypes`, and
  `strictTemplates`; ESLint (`angular-eslint` + `consistent-type-imports`, `no-explicit-any`,
  `no-non-null-assertion`, `no-console`) runs with `--max-warnings=0`.
- Prettier (`printWidth: 120`, matching the backend) checks every file.
- Vitest covers contracts, stores, pipes, and services (`HttpTestingController`); coverage uploads
  as an artifact (backend parity target: 80% lines / 70% branches on core logic).
- `npm audit --audit-level=high` blocks on vulnerable dependencies.

## Roadmap

- [x] Quality baseline (toolchain pins, strict TS, ESLint-as-errors, Prettier, CI, Dockerfile)
- [x] API client primitives (Problem Details, cursor pages, money, idempotency, ETag, correlation)
- [x] Auth flow (register, sign-in with profile load, refresh, revocation, guards)
- [x] Catalog discovery (search/sort/cursor list, detail)
- [ ] Cart slice (open/get/add/remove against `POST/GET /carts*`)
- [ ] Checkout slice (`POST /carts/{id}/checkout` 202 + poll `GET /checkouts/{id}`)
- [ ] Ordering, billing, shipping, customers slices
- [ ] Staff catalog writes (create/rename/price/activation/discontinuation/delete with `If-Match`)
- [ ] E2E (Playwright) for critical journeys: discovery → cart → checkout → order
- [ ] OpenTelemetry browser tracing + SLO dashboards
