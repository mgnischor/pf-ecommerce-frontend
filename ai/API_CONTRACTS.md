# API Contracts (consumer side)

> The backend (`../pf-ecommerce-backend`) owns the contract; this document states what the client must
> honor when calling `/api/v1`. Backend rule: versioned base path, resource nouns, domain commands
> (`POST /orders/{id}/cancellation`), UUIDs, string enums, UTC ISO dates, decimal-string money.

## Conventions

- **Base:** `apiBaseUrl` + `/products`, … Paths and query names are copied verbatim from OpenAPI.
- **Money:** `{ amount: "189.90", currency: "BRL" }` stays a string; `MoneyPipe` formats for display only.
- **Pagination:** `limit` (default 20, max 100, clamped in `ApiClient.pageParams`) + opaque `cursor`;
  render `items`, follow `nextCursor` while `hasMore`. Empty is `200` + `[]` → `EmptyState`, never 404.
- **Errors:** RFC 9457 + `errors[] { ruleId, field, code, message, params }`. Branch on `code`, show
  `detail`/`message` plus `traceId` for support. `ProblemErrors` renders all errors at once with field
  pointers. Status meaning: `400` malformed, `422` rule violation, `401` re-auth, `403` forbidden/step-up,
  `404` not found (or hidden foreign resource), `409` conflict, `412` stale version, `429/503` back off
  with `Retry-After`.
- **Safeguards:** retried unsafe requests send `Idempotency-Key: newIdempotencyKey()` (one key per
  payload); stateful writes send `If-Match: "<version>"`; destructive confirmations are server-enforced
  fields, not client modals. `409` responses surface `allowedActions` instead of guessing transitions.
- **Headers:** `X-Request-ID` (auto), `Accept-Language` (auto from locale), `Authorization` (auto except
  `X-Skip-Auth` anonymous calls). Personal data never goes in URLs.

## Definition of Done

New calls type request/response interfaces in their feature, encode queries through `ApiClient`, attach
safeguard headers where the backend requires them, and render every documented status/error code.
