# Code Quality Standards

> Frontend equivalent of backend `ai/CODE.md`. Every mandatory item blocks merge unless a documented
> exception is approved.

## Quality gates (CI `quality` job)

| Gate | Requirement |
| --- | --- |
| Toolchain | `.nvmrc` + `engines` + `packageManager`; `npm ci` (fails on lockfile drift) |
| Formatting | `npm run format:check` (Prettier, `printWidth: 120`, backend parity) |
| Lint | `npm run lint` (`ng lint --max-warnings=0`) |
| Types | `strict`, `noUnusedLocals/Parameters`, `exactOptionalPropertyTypes`, `strictTemplates` |
| Build | `npm run build:ci` (production, bundle budgets enforced) |
| Tests | `npm run test:ci` (Vitest + coverage artifact) |
| Dependencies | `npm audit --audit-level=high` |

## TypeScript / Angular rules

- Standalone components, `OnPush` everywhere, `input()`/`output()` signal APIs, no `NgModules`.
- `import type` for type-only imports (`consistent-type-imports`); no `any`, no `!`, no `console.log`
  (only `warn`/`error` through `Logger`).
- Constructor-field injection via `inject()`; no service locator, no state in services besides stores.
- Templates use `@if`/`@for` control flow with `track`; `track` keys are stable IDs, never indexes.
- Styles via Tailwind utilities; component CSS only for truly local concerns.

## RxJS rules

- Services expose cold Observables; one subscription per view lifecycle (`takeUntilDestroyed`).
- `debounceTime`/`distinctUntilChanged` for search; `switchMap` for param-driven loads; `finalize` for
  `isLoading`; `catchError` maps to `ProblemDetails`, never swallows.
- Randomness only from `crypto.randomUUID()` (request IDs, idempotency keys). No `Math.random`.

## Recommended libraries

Angular/RxJS/Tailwind/Vitest/ESLint/Prettier are the defaults. New dependencies need an approved
license (no GPL/AGPL, no newly-commercial packages without approval) and a PR justification. Mixing
two libraries for one purpose is forbidden.

## PR standards

Conventional Commits, <500 lines preferred, refactoring separated from behavior, screenshots for UI,
contract diffs (`endpoint + status codes + error codes`) for API work, backend rule ID referenced.

## Definition of Done

Gates green, no `TODO` without an owner/date, docs (`README`/`ai/TASKS.md`) updated for behavior changes.
