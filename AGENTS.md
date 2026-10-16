# AGENTS.md

## Project overview

`todo-hexagonal` is a TODO API exposed over **REST (Fastify 5)** and **gRPC** (`@grpc/grpc-js` 1 + `ts-proto` 2), backed by **PostgreSQL 16** (`pg` 8). It is a reference implementation of **Hexagonal Architecture (Ports & Adapters)** in **TypeScript 7** (ESM / NodeNext) on Node 24 with pnpm 11. The goal is keeping business rules independent from frameworks, HTTP and the database.

## Commands

- Install: `pnpm install` (the `prepare` script also runs `proto:generate`)
- Dev (watch): `pnpm dev` (tsx watch, reads `.env`)
- Build: `pnpm build` (`proto:generate` + tsc → `dist/`)
- Start: `pnpm start`
- Test: `pnpm test` (all) · `pnpm test:unit` · `pnpm test:e2e` · `pnpm test:related <files>` · `pnpm test:coverage`
- Format: `pnpm format` · check: `pnpm format:check`
- Type-check tests: `pnpm typecheck:tests`
- Generate gRPC code: `pnpm proto:generate`

**Verification order** (mirrors `.github/workflows/ci.yml`): `pnpm format:check` → `pnpm typecheck:tests` → `pnpm build` → `pnpm test`.

## Architecture

Dependencies always point **inward**, toward the domain. The domain knows nothing about Fastify, gRPC or `pg`. Depend on domain **contracts/ports**, never on concrete adapters.

| Layer          | Path                 | Responsibility                                                             |
| -------------- | -------------------- | -------------------------------------------------------------------------- |
| Domain         | `src/domain`         | Entities, contracts, errors and the `TodoRepository` port. Framework-free. |
| Use cases      | `src/usecases`       | Application rules; orchestrate the domain through ports.                   |
| Interfaces     | `src/interfaces`     | Driving adapters: HTTP routes/controllers and gRPC service/handlers.       |
| Infrastructure | `src/infrastructure` | Driven adapters: `pg` pool and the Postgres repository.                    |

Request flow (`POST /api/v1/todos`): route validates the body via JSON Schema → controller reads the request and calls the use case → use case enforces the rule and calls `TodoRepository.save` → `PgTodoRepository` runs SQL → `TodoPresenter` serializes the entity.

## Conventions

- **ESM / NodeNext**: relative imports **must end in `.js`** (e.g. `./CreateTodoUseCase.js`).
- One class per file for use cases, controllers and gRPC handlers; the filename matches the class name.
- Inject dependencies via the **constructor typed by the domain contract** (e.g. `CreateTodoContract`), not by concrete classes.
- HTTP routes: declare **inline JSON Schema** in `src/interfaces/http/routes/todoRoutes.ts` with `additionalProperties: false`; add a per-route `rateLimit`; declare response schemas.
- Always serialize responses with `TodoPresenter.toJSON`; never leak entities directly.
- Errors: throw `ApplicationError(message, code)` from the domain/use cases. Controllers and handlers **never format errors** — mapping lives in `httpErrorHandler` (`VALIDATION_ERROR`→400, `NOT_FOUND`→404, other domain codes→422, unexpected→500) and `grpcErrorMapper`.
- **Adding an HTTP feature**: controller in `src/interfaces/controllers/`, factory in `src/interfaces/http/factories/controllers/`, register in `makeTodoControllers.ts`, then add the route to `todoRoutes.ts`.
- **Adding a gRPC RPC**: edit `proto/todo.proto`, run `pnpm proto:generate`, add the handler in `src/interfaces/grpc/controllers/`, register in `makeTodoHandlers.ts` and `src/interfaces/grpc/routes/todoService.ts`.
- Keep business validation in the use case, not in the adapters.

## Tests

- Vitest; config in `vitest.config.ts` (node environment, includes `tests/**/*.test.ts`).
- Layout: `tests/unit/<layer>/...` for unit tests; `tests/e2e/...` for full flows.
- Reuse the doubles in `tests/support/` (`fake-todo-repository`, `build-test-app`, `reply-mock`, `grpc-handler-mock`, `repository-mock`) instead of creating new mocks.
- HTTP e2e uses `app.inject()`; gRPC e2e spins up a real server.
- Coverage excludes `src/main.ts`, the HTTP factories and the generated gRPC code.

## Gotchas

- `src/interfaces/grpc/generated/` is **gitignored and generated** — never edit it by hand. Re-run `pnpm proto:generate` after changing `proto/todo.proto`.
- Pre-commit runs Husky + lint-staged (prettier + `vitest related --run`). CI sets `HUSKY=0`.
- The server **fails fast** if a required env var is missing (`src/infrastructure/config/env.ts`); see `.env.example`.
- Feature plans live in `docs/superpowers/plans/`.
