# Tests

> Pyramid: mostly unit tests, some service tests, few E2E (Playwright, planned) on critical journeys
> only (discovery → cart → checkout → order).

## Layout

- `*.spec.ts` next to its unit under `src/`; behavior names (`should … when …`).
- Pure logic (levels, guards-as-functions, error mapping, pagination clamping) needs no TestBed.
- Services use `provideHttpClient()` + `provideHttpClientTesting()` + `HttpTestingController`;
  assert URLs, params, and headers (`X-Skip-Auth`, `Idempotency-Key`, `If-Match`), then `http.verify()`.
- Components assert rendered states (loading/empty/error/rows), not internals. Router tests provide
  `provideRouter([])` plus `API_BASE_URL`/`DEFAULT_LOCALE` doubles.

## Gates

- `npm run test:ci` (`ng test --watch=false --coverage`) passes; coverage artifact uploads.
- Target parity with the backend: 80% lines / 70% branches on `core/` logic; new code ships with tests.
- A flaky test is quarantined within 24h, fixed or removed within 2 sprints — never re-run silently.

## Definition of Done

Every status code and error code introduced or changed has a test; contract-sensitive headers have
service tests; user-visible states have component or E2E coverage when the slice lands.
