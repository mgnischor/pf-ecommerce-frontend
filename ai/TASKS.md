# Tasks

Tracks storefront progress against the backend's 35 endpoints (`../pf-ecommerce-backend/Portfolio.http`).

## Done

- [x] Toolchain pins (`.nvmrc`, `engines`, `packageManager`, locked CI restore)
- [x] Strict TS + ESLint-as-errors + Prettier (printWidth 120, backend parity) + CI + Dockerfile
- [x] Core contracts (Problem Details, cursor pages, money) + `ApiClient` + interceptors
- [x] Auth flow (register, sign-in + profile, refresh, revocation, guards, memory-only store)
- [x] Catalog discovery (`GET /products`, `GET /products/{id}` + list/detail pages)
- [x] Identity pages (`/sign-in`, `/register`) + shell + 404/forbidden + `NotImplemented` pattern

## Next

- [ ] Cart slice (`POST /carts`, `GET /carts/{id}`, `POST …/items`, `DELETE …/items/{itemId}`)
- [ ] Checkout slice (`POST /carts/{id}/checkout` 202 + `GET /checkouts/{id}` polling)
- [ ] Ordering slice (list/detail/cancel with `Idempotency-Key` + `If-Match` + `allowedActions`)
- [ ] Billing slice (payment detail, refunds with step-up + approval states)
- [ ] Shipping slice (`GET /orders/{id}/shipments`)
- [ ] Customers slice (`GET/PATCH /customers/me`, merge-patch, masked contacts)
- [ ] Staff catalog writes (create/rename/price/activation/discontinuation/delete)
- [ ] E2E (Playwright): discovery → cart → checkout → order; auth matrix per route
- [ ] OTel browser tracing, SLO dashboards, digest-pinned images + Renovate/Dependabot
