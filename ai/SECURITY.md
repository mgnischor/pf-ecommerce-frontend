# Security

> Frontend mirror of backend `ai/SECURITY.md`. The backend enforces; the client must not undermine.

- **Tokens:** in-memory signals only (`AuthStore`). Never `localStorage`/`sessionStorage`/cookies-by-JS,
  never in URLs, never in logs or telemetry. Refresh rotation failure clears the session (fail closed).
- **Secrets:** none in code, environments, images, or history. `.env` is untracked; `.env.example` shows
  shape only. Backend keys stay server-side.
- **Injection:** no `innerHTML` for user content (reviews, names, addresses render as text); HTTP params
  go through `HttpParams`; router links never interpolate PII into query strings.
- **Transport:** production serves over TLS at the edge (nginx `__Host__` posture, `nosniff`/`DENY`
  frame headers in `nginx.conf`); `/healthz` is the only unauthenticated local path and carries no data.
- **Logging:** `Logger` sends `warn`/`error` with correlation IDs only. No passwords, tokens, card data,
  tax IDs, or full contact data at any level. Failures show `traceId`, never internals.
- **Dependencies:** `npm audit --audit-level=high` gates; new packages need license approval; pin review
  on every standards update.

## Definition of Done

No credential, token, or PII in code, logs, build output, or screenshots; auth-protected routes tested
as anonymous and as insufficient levels; `npm audit` clean.
