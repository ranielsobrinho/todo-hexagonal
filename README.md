# todo-hexagonal

A small REST API that manages a TODO list, built with **Fastify** and **PostgreSQL** on top of a **Hexagonal (Ports & Adapters)** architecture in **TypeScript**.

[![Node](https://img.shields.io/badge/node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/typescript-7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

---

## About

This project is a reference implementation of a clean, layered backend. Its goal is not the TODO feature itself, but to demonstrate how to keep **business rules independent from frameworks, HTTP, and the database** by applying Hexagonal Architecture (a.k.a. Ports & Adapters) with a pragmatic, framework-idiomatic structure.

The domain and use cases know nothing about Fastify or `pg`. HTTP controllers and the Postgres repository are swappable adapters that plug into interfaces (ports) owned by the domain.

## Tech stack

| Concern           | Choice                                                |
| ----------------- | ----------------------------------------------------- |
| Runtime / tooling | Node.js 24, pnpm 11                                   |
| Language          | TypeScript 7 (native compiler), ES Modules (NodeNext) |
| HTTP              | Fastify 5                                             |
| Database          | PostgreSQL 16 (Docker Compose) + `pg` 8               |
| Tests             | Vitest 5 + `@vitest/coverage-v8`                      |
| Code quality      | Prettier 3, Husky 9, lint-staged 17                   |
| Dev runner        | `tsx` (watch mode)                                    |

## Architecture

Hexagonal Architecture organizes code so that **dependencies always point inward**, toward the domain. The domain defines _ports_ (interfaces); the outer layers provide _adapters_ that implement them.

```
            ┌───────────────────────────────────────────────┐
            │                Interfaces                     │  driving adapters
            │   routes → controllers → presenters           │  (HTTP in)
            └───────────────────────┬───────────────────────┘
                                    │ depends on
                                    ▼
            ┌───────────────────────────────────────────────┐
            │                 Use cases                     │  application rules
            │  CreateTodo · GetTodoById · ListTodos         │
            └───────────────────────┬───────────────────────┘
                                    │ depends on
                                    ▼
            ┌───────────────────────────────────────────────┐
            │                  Domain                       │  business core
            │  Todo · contracts · TodoRepository (port)     │  (no outward imports)
            └───────────────────────▲───────────────────────┘
                                    │ implements
            ┌───────────────────────┴───────────────────────┐
            │              Infrastructure                   │  driven adapters
            │   PgTodoRepository · pg Pool                  │  (database out)
            └───────────────────────────────────────────────┘
```

### Layers and responsibilities

| Layer          | Path                 | Responsibility                                                                |
| -------------- | -------------------- | ----------------------------------------------------------------------------- |
| Domain         | `src/domain`         | Entities, contracts, errors and **ports** (`TodoRepository`). Framework-free. |
| Use cases      | `src/usecases`       | Application rules; orchestrate the domain through ports.                      |
| Interfaces     | `src/interfaces`     | Driving adapters: HTTP routes, controllers, presenters and the error handler. |
| Infrastructure | `src/infrastructure` | Driven adapters: `pg` connection pool and the Postgres repository.            |

### Request flow (example: `POST /api/v1/todos`)

1. **Route** (`todoRoutes`) validates the body against a JSON schema and calls the controller.
2. **Controller** (`CreateTodoController`) reads `request.body` and calls the use case.
3. **Use case** (`CreateTodoUseCase`) enforces the business rule and calls `TodoRepository.save`.
4. **Adapter** (`PgTodoRepository`) runs the SQL against PostgreSQL and maps rows to `Todo`.
5. The entity is serialized by **`TodoPresenter`** and returned as JSON.

Swapping Postgres for another store means writing a new `TodoRepository` adapter — no changes in the domain or use cases.

## Project structure

```
src/
├── domain/                              # Business core (no framework imports)
│   ├── contracts/todo/                  # Inbound contracts
│   │   ├── CreateTodoContract.ts
│   │   ├── GetTodoByIdContract.ts
│   │   └── ListTodosContract.ts
│   ├── entities/Todo.ts                 # Todo entity + invariants
│   ├── errors/ApplicationError.ts       # Error type carrying a domain code
│   └── repositories/ITodoRepository.ts  # Repository port
├── usecases/todo/                       # Application rules
│   ├── CreateTodoUseCase.ts
│   ├── GetTodoByIdUseCase.ts
│   └── ListTodosUseCase.ts
├── interfaces/                          # Driving adapters
│   ├── controllers/                     # HTTP controllers
│   ├── presenters/TodoPresenter.ts      # Entity → JSON mapping
│   └── http/
│       ├── errors/httpErrorHandler.ts   # Maps domain errors → HTTP status
│       ├── routes/                       # apiRoutes, todoRoutes, healthRoutes
│       └── server.ts                    # buildServer(dependencies)
├── infrastructure/                      # Driven adapters
│   ├── database/pool.ts                 # pg Pool
│   └── repositories/TodoRepository.ts   # PgTodoRepository
└── main.ts                              # Composition root + bootstrap

tests/
├── e2e/                                 # Full HTTP flows via app.inject()
│   ├── todos.routes.test.ts
│   └── health.routes.test.ts
├── unit/
│   ├── controllers/
│   ├── repositories/
│   └── usecases/
├── support/                             # Test doubles and helpers
│   ├── build-test-app.ts
│   ├── fake-todo-repository.ts
│   ├── reply-mock.ts
│   └── repository-mock.ts
└── smoke.test.ts
```

## Getting started

### Prerequisites

- Node.js 24+
- pnpm 11+
- Docker (for the PostgreSQL container)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL (creates the `todos` table from init.sql)
docker compose up -d

# 3. Run in watch mode
pnpm dev
```

The HTTP server starts on `PORT` (defaults to `3000`; this project ships `.env` with `5000`).

### Environment variables

Copy `.env.example` to `.env` and adjust as needed. The server **fails fast** if a required variable is missing.

| Variable     | Required | Default | Example          |
| ------------ | -------- | ------- | ---------------- |
| `PORT`       | no       | `3000`  | `5000`           |
| `PGHOST`     | yes      | —       | `localhost`      |
| `PGPORT`     | no       | `5432`  | `5432`           |
| `PGUSER`     | yes      | —       | `todo`           |
| `PGPASSWORD` | yes      | —       | `todo`           |
| `PGDATABASE` | yes      | —       | `todo_hexagonal` |
| `PGPOOL_MAX` | no       | `10`    | `20`             |
| `PGSSL`      | no       | `false` | `true`           |

`PGSSL=true` enables TLS to Postgres (`rejectUnauthorized: true`).

### Production build

```bash
pnpm build   # tsc → dist/
pnpm start   # node --env-file=.env dist/main.js
```

### Docker

The included `Dockerfile` builds a multi-stage image and runs as the non-root `node` user:

```bash
docker build -t todo-hexagonal .
docker run --rm -p 3000:3000 --env-file=.env todo-hexagonal
```

## API

All application routes are versioned under `/api/v1`. Health check lives at the root.

| Method | Endpoint            | Description               | Success | Errors              |
| ------ | ------------------- | ------------------------- | ------- | ------------------- |
| `POST` | `/api/v1/todos`     | Create a todo             | `201`   | `400`, `429`        |
| `GET`  | `/api/v1/todos`     | List todos (newest first) | `200`   | `400`, `429`        |
| `GET`  | `/api/v1/todos/:id` | Get a todo by id (UUID)   | `200`   | `400`, `404`, `429` |
| `GET`  | `/health`           | Liveness + DB check       | `200`   | `503`, `429`        |

### Pagination

`GET /api/v1/todos` accepts `limit` (1–100, default `50`) and `offset` (≥ 0, default `0`). The response is a bounded array.

### Examples

```bash
# Create
curl -X POST http://localhost:5000/api/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"name":"buy milk"}'
# → 201 {"id":"...","name":"buy milk","createdAt":"...","done":false}

# List
curl http://localhost:5000/api/v1/todos

# List (paginated)
curl "http://localhost:5000/api/v1/todos?limit=20&offset=40"

# Get by id
curl http://localhost:5000/api/v1/todos/<uuid>

# Health
curl http://localhost:5000/health
# → 200 {"status":"ok","database":"up"}
```

### Error handling

Controllers never format errors themselves. `httpErrorHandler` maps a domain `ApplicationError` (which carries a `code`) to an HTTP status:

| Code / situation                     | HTTP status |
| ------------------------------------ | ----------- |
| JSON-schema validation               | `400`       |
| `VALIDATION_ERROR`                   | `400`       |
| `NOT_FOUND`                          | `404`       |
| Any other domain code                | `422`       |
| Fastify client error (e.g. limiting) | `4xx`       |
| Unexpected error                     | `500`       |

Error body shape: `{ "error": "<code>", "message": "<human readable>" }`.

## Security

Defense in depth at the HTTP, validation and database layers:

- **Security headers** — [`@fastify/helmet`](https://github.com/fastify/fastify-helmet) sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options` and more.
- **Rate limiting** — [`@fastify/rate-limit`](https://github.com/fastify/fastify-rate-limit) applies a global `100 req/min` per IP limit; `POST /api/v1/todos` is stricter (`20 req/min`). Exceeding it returns `429`.
- **Request limits** — 100 KB body limit plus `connectionTimeout` (10s), `requestTimeout` (15s) and `keepAliveTimeout` (72s) to mitigate slowloris and slow-body attacks.
- **Strict input validation** — JSON schemas reject unknown properties, `:id` must be a UUID, `name` is capped at 255 chars and list queries are bounded.
- **Parameterized SQL** — every query uses `$1` placeholders, so there is no SQL-injection surface.
- **Fail-fast configuration** — required environment variables are validated at boot and the process exits if the database is unreachable.
- **Hardened pool** — bounded pool size, idle/connection timeouts and optional TLS (`PGSSL=true`).
- **Local infra** — Postgres binds to `127.0.0.1` only and reads credentials from the environment; the container image runs as non-root.

Out of scope for now: authentication/authorization (all endpoints are public), CORS (no browser client) and TLS termination (expected at the proxy).

## Testing

Tests are written with **Vitest** and split into two layers:

- **Unit tests** (`tests/unit`) cover use cases, controllers and the repository. The repository is tested against a **mocked `pg.Pool`** — no database required.
- **E2E tests** (`tests/e2e`) exercise the real Fastify app through `app.inject()` using an **in-memory `FakeTodoRepository`**, so the whole HTTP stack runs without Postgres.

Ports make this possible: the same `buildServer(dependencies)` used in production is wired with a fake adapter in tests.

```bash
pnpm test            # run the whole suite once
pnpm test:unit       # only unit tests (once)
pnpm test:unit:watch # only unit tests, watch mode (TDD)
pnpm test:e2e        # only e2e tests
pnpm test:watch      # all tests in watch mode
pnpm test:coverage   # run with V8 coverage report
pnpm test:related <files...>   # only tests affected by the given files
pnpm typecheck:tests # type-check src and tests
```

## Git hooks

Husky runs checks automatically:

- **pre-commit** — `lint-staged` formats staged files with Prettier and runs `vitest related` on staged `.ts` files (only the tests affected by your changes).
- **pre-push** — runs `prettier --check .` and the **full** test suite.

## Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `dev`             | Start in watch mode with env loading (`tsx`) |
| `build`           | Compile with `tsc` to `dist/`                |
| `start`           | Run the compiled server                      |
| `format`          | Format the codebase with Prettier            |
| `format:check`    | Verify formatting without writing            |
| `test`            | Run the test suite once                      |
| `test:unit`       | Run only unit tests (once)                   |
| `test:unit:watch` | Run only unit tests in watch mode (TDD)      |
| `test:e2e`        | Run only e2e tests                           |
| `test:related`    | Run tests affected by the given files        |
| `test:watch`      | Run all tests in watch mode                  |
| `test:coverage`   | Run tests with coverage                      |
| `typecheck:tests` | Type-check `src` and `tests`                 |
| `prepare`         | Install Husky hooks (runs on `pnpm install`) |

## Design decisions

- **ES Modules + NodeNext** — relative imports must include the `.js` extension, even from `.ts` files, to match the emitted output.
- **Ports & adapters** — `TodoRepository` is defined in the domain; `PgTodoRepository` (production) and `FakeTodoRepository` (tests) are interchangeable adapters.
- **Composition root** — `main.ts` builds the dependency graph and passes controllers to `buildServer`, keeping construction out of the HTTP layer.
- **Thin controllers** — controllers only translate HTTP ↔ use case calls; a presenter maps entities to DTOs (`createdAt` serialized as ISO-8601).
- **Domain errors** — use cases throw `ApplicationError` with a stable `code`; a single handler translates codes to HTTP statuses.

## License

Released under the [MIT License](./LICENSE).
