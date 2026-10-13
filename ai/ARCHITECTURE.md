# Architecture

> Slice-per-context storefront. Dependency direction: `features → core ← shared`. Shell (`app.ts`)
> owns layout only.

## Layers

- `core/` — singletons provided in root: `api/` (tokens, `ApiClient`, contract primitives),
  `auth/` (levels, store, service, guards), `http/` (auth/correlation/language interceptors, error
  normalization), `i18n/` (locale state), `observability/` (redacting logger). Never imports `features/`.
- `shared/` — dumb, reusable, dependency-free: `ui/` (problem-errors, empty-state, not-found, …),
  `pipes/` (money), `utils/` (idempotency-key). Never imports `core/` or `features/`.
- `features/<context>/` — one bounded context each: models, service (endpoint calls), routed pages.
  Never imports sibling features. `catalog/` and `identity/` are wired; the rest render
  `NotImplemented` until their use cases land (frontend mirror of backend `501`).
- `environments/` — build-time config (`apiBaseUrl`, `defaultLocale`); no secrets.

## Routing

Lazy `loadComponent` per slice, `withComponentInputBinding()` for route data, `authGuard` /
`requireLevel()` for protection (default-deny; anonymous routes send `X-Skip-Auth` at the HTTP layer
and need no guard). Unwired slices map to `NotImplemented` with `data.title`.

## State

Signals hold view state; RxJS owns async streams. Services return cold Observables; components subscribe
once with `takeUntilDestroyed` (or `async` pipe), mapping failures through `toProblemDetails()` into a
`problem` signal. `AuthStore` is the only cross-slice store (in-memory session).

## ADRs

Record frontend-significant decisions (test runner, token storage, SSR deferral) as short ADRs in
`docs/adr/` (numbered, dated, with status). Backend rule IDs (`BR-CAT-003`, …) are referenced, not
redefined.

## Definition of Done

New slices ship with typed contracts, guarded routes, loading/empty/error/success states, unit tests,
and a TASKS.md checkbox flip. No cross-feature imports (ESLint `no-restricted-imports` + review).
