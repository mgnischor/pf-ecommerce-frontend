# AGENTS.md

> This file orients any AI coding agent (and any human) working in this repository. It does not replace
> the standards documents — it tells you which one governs the task in front of you, and lists the rules
> that are load-bearing across all of them. When this file and a standards document disagree, the standards
> document wins; open an issue rather than guessing. Mirrors `../pf-ecommerce-backend/AGENTS.md`.

---

## 0. The project in one paragraph

`pf-ecommerce-frontend` is the storefront of a full e-commerce platform: **Angular 22 (standalone,
zoneless) + RxJS + Tailwind CSS**, organized by bounded context (`src/app/features/catalog`, `cart`,
`checkout`, `identity`, …). `src/app/core` owns singletons (typed API client, auth store, interceptors,
i18n, logging); `src/app/shared` owns dumb UI, pipes, and utils. The dependency direction is
`features → core ← shared`. There is **no backend** in this repository; it is an HTTP client of the
versioned API (`/api/v1`) built in `../pf-ecommerce-backend`.

| Concern   | Technology                                                          |
| --------- | ------------------------------------------------------------------- |
| Framework | Angular 22 standalone, zoneless, strict templates                   |
| Streams   | RxJS 7 + signals (`toSignal`/`takeUntilDestroyed` interop)          |
| Styling   | Tailwind CSS 4                                                      |
| Tests     | Vitest (`ng test --coverage`), `HttpTestingController` for services |
| Docs      | Backend OpenAPI + Scalar (development only, in the backend repo)    |
| Packaging | Docker (`Dockerfile`, nginx non-root)                               |

---

## 1. The standards suite

All guidance documents live in the `ai/` folder. Read the relevant one(s) before writing code, not after.
`ai/TASKS.md` tracks task progress.

| Document                | Governs                                                               | Read it when you are about to...        |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| **ai/ARCHITECTURE.md**  | Slices, layers, routing, state, ADRs                                  | Add a feature, a route, or shared state |
| **ai/CODE.md**          | Quality gates, TypeScript/Angular/RxJS rules, libraries, PR standards | Write or review any code                |
| **ai/TESTS.md**         | Pyramid, Vitest layout, coverage gates                                | Write any test                          |
| **ai/API_CONTRACTS.md** | Consumer-side contract rules (pagination, money, errors, safeguards)  | Call an endpoint or render a failure    |
| **ai/SECURITY.md**      | Token handling, secrets, OWASP, logging redaction                     | Touch auth, tokens, secrets, or logging |

Every document ends with a **Definition of Done** and allows **documented exceptions only** (owner, scope,
risk, rationale, expiration date). Silent deviation is never acceptable.

---

## 2. Rules that apply regardless of task

- **One slice, one bounded context.** A feature folder owns exactly one context; cross-feature imports are
  forbidden. Share contracts through `core/`.
- **Thin client, authoritative server.** Prices, totals, and discounts are computed by the API; the client
  never sends authoritative amounts. Money stays a decimal string on the wire.
- **Type the contract.** Every endpoint has request/response interfaces in its feature; `any` and
  non-null assertions are errors. Branch on Problem Details `code`, never on `message`.
- **Unsafe retries carry `Idempotency-Key`.** Checkout, payment, refund, cancellation, deletion: one UUID
  per payload via `newIdempotencyKey()`.
- **Stateful writes carry `If-Match`.** Version comes from the resource; `412`/`409` surface the current
  state and `allowedActions` instead of retrying blindly.
- **Tokens live in memory.** Never `localStorage`/`sessionStorage`, never in logs, never in URLs.
- **Fail closed.** HTTP failures normalize to Problem Details via `toProblemDetails()`; views render
  loading/empty/error/success explicitly. Empty collections are `200` with `[]`, never `404`.
- **Correlate everything.** Every request sends `X-Request-ID`; every failure surfaces `traceId` for support.
- **Tests for the layer.** Pure logic gets unit tests (no TestBed HTTP); services use
  `HttpTestingController`; components assert rendered states, not implementation.
- **Small PRs.** Prefer under 500 changed lines; separate refactoring from behavior; use Conventional
  Commits and reference the backend rule ID (`BR-CAT-003`) when contract behavior changes.

---

## 3. Task-based index

| You are about to...                  | Go to                                          |
| ------------------------------------ | ---------------------------------------------- |
| Add a feature slice or route         | `ai/ARCHITECTURE.md`                           |
| Write a component, service, or store | `ai/CODE.md`, `ai/ARCHITECTURE.md`             |
| Call an endpoint or render an error  | `ai/API_CONTRACTS.md`                          |
| Write a unit test                    | `ai/TESTS.md`                                  |
| Touch auth, tokens, or secrets       | `ai/SECURITY.md`                               |
| Choose a library or add a dependency | `ai/CODE.md` (recommended set + license check) |
| Open a pull request                  | `ai/CODE.md` (review checklist)                |

---

## 4. Before you consider a task done

1. The change stays inside its slice and respects `features → core ← shared`.
2. New/changed API calls type their contracts, paginate collections, format money/dates per
   `ai/API_CONTRACTS.md`, and carry idempotency/precondition headers where required.
3. No secret, token, or PII appears in code, logs, or build output.
4. Routes name their minimum access level; anonymous routes opt out explicitly.
5. Tests cover the change at the appropriate layer and pass in CI; `format:check`, `lint`
   (`--max-warnings=0`), `build:ci`, and `test:ci` are green.
6. Any deviation is documented with owner, scope, risk, rationale, and expiration date.

---

_Last updated: October 13, 2026_
