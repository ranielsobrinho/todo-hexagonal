# Automated test suite for todo-hexagonal

## Goal

Add an automated test suite covering the whole hexagonal API:

- **Unit tests** for use cases, controllers and the repository.
- **E2E tests** for every HTTP route (todos + health) via `app.inject()`.

Runner: **Vitest** (TS `^7.0.2`, Fastify `^5`, `pg ^8`, ESM + NodeNext).

## Decisions

- **Vitest** (not `node:test` / Jest). Vitest transpiles via esbuild and never
  invokes `tsc`, so the `typescript-eslint` x TS 7 incompatibility does not
  affect tests. Vitest also resolves `.js` specifiers to `.ts` sources, which is
  required by our NodeNext imports.
- **Repository** is tested with a mocked `pg.Pool` only. No real database.
- **E2E** uses an in-memory `FakeTodoRepository` injected through
  `buildServer()` + `app.inject()`. No network, no DB.
- Tests live in a top-level `tests/` directory mirroring `src/`.
- One commit per task.

## Gotchas

- NodeNext imports require `.js` extensions, including inside test files.
- `healthRoutes` imports `pool` directly, so its e2e test must mock
  `src/infrastructure/database/pool.js` with `vi.hoisted` + `vi.mock`.
- Fastify `prefix` is part of the plugin options object; never re-forward the
  whole `opts` into a child `register` (duplicates `/api/v1/api/v1/...`).
- Fastify's default ajv uses `removeAdditional: true`, so extra body props are
  stripped silently (they do not produce a 400).
- `GetTodoByIdUseCase.execute` throws **synchronously** when `id` is empty.

## Task 1 - Vitest bootstrap

Files:

- `package.json`: add dev deps and scripts.
- `vitest.config.ts`
- `tsconfig.test.json`
- `.gitignore`, `.prettierignore`: ignore `dist/` and `coverage/`.
- `tests/smoke.test.ts`

Commands:

```bash
pnpm add -D vitest@^5 @vitest/coverage-v8@^5
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/main.ts'],
    },
  },
})
```

`tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"]
}
```

`package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"typecheck:tests": "tsc -p tsconfig.test.json"
```

`tests/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Todo } from '../src/domain/entities/Todo.js'

describe('smoke', () => {
  it('resolves .js specifiers to TypeScript sources', () => {
    expect(Todo).toBeDefined()
  })
})
```

Verify: `pnpm test` passes, `pnpm typecheck:tests` is clean. Commit.

## Task 2 - Test doubles (`tests/support/`)

`repository-mock.ts`:

```ts
import { vi } from 'vitest'
import type { TodoRepository } from '../../src/domain/repositories/ITodoRepository.js'

export type MockedTodoRepository = {
  save: ReturnType<typeof vi.fn>
  getById: ReturnType<typeof vi.fn>
  list: ReturnType<typeof vi.fn>
}

export function createRepositoryMock(): MockedTodoRepository {
  return {
    save: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
  }
}

export function asTodoRepository(mock: MockedTodoRepository): TodoRepository {
  return mock as unknown as TodoRepository
}
```

`reply-mock.ts`:

```ts
import { vi } from 'vitest'
import type { FastifyReply } from 'fastify'

export type ReplyMock = FastifyReply & {
  status: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
}

export function createReplyMock(): ReplyMock {
  const reply = {
    status: vi.fn(),
    send: vi.fn(),
  }
  reply.status.mockReturnValue(reply)
  reply.send.mockResolvedValue(reply)
  return reply as unknown as ReplyMock
}
```

`fake-todo-repository.ts`:

```ts
import { randomUUID } from 'node:crypto'
import { Todo } from '../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../src/domain/errors/ApplicationError.js'
import type {
  TodoParam,
  TodoRepository,
} from '../../src/domain/repositories/ITodoRepository.js'

export class FakeTodoRepository implements TodoRepository {
  private readonly todos = new Map<string, Todo>()

  async save(params: TodoParam): Promise<Todo> {
    const todo = new Todo(
      randomUUID(),
      params.name,
      params.createdAt ?? new Date(),
      params.done ?? false,
    )
    this.todos.set(todo.id, todo)
    return todo
  }

  async getById(id: string): Promise<Todo> {
    const todo = this.todos.get(id)
    if (!todo) {
      throw new ApplicationError(
        `Todo with id ${id} was not found`,
        'NOT_FOUND',
      )
    }
    return todo
  }

  async list(): Promise<Todo[]> {
    return [...this.todos.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )
  }
}
```

Verify: `pnpm typecheck:tests` is clean. Commit.

## Task 3 - Use case unit tests

`tests/unit/usecases/create-todo.use-case.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { CreateTodoUseCase } from '../../../src/usecases/todo/CreateTodoUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('CreateTodoUseCase', () => {
  it('throws VALIDATION_ERROR when the name is empty', async () => {
    const repository = createRepositoryMock()
    const useCase = new CreateTodoUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ name: '' })).rejects.toMatchObject({
      name: 'ApplicationError',
      code: 'VALIDATION_ERROR',
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('delegates to repository.save with done=false', async () => {
    const repository = createRepositoryMock()
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    repository.save.mockResolvedValue(todo)
    const useCase = new CreateTodoUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ name: 'buy milk' })).resolves.toBe(todo)
    expect(repository.save).toHaveBeenCalledWith({
      name: 'buy milk',
      done: false,
    })
  })
})
```

`tests/unit/usecases/get-todo-by-id.use-case.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { GetTodoByIdUseCase } from '../../../src/usecases/todo/GetTodoByIdUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('GetTodoByIdUseCase', () => {
  it('throws synchronously when the id is empty', () => {
    const repository = createRepositoryMock()
    const useCase = new GetTodoByIdUseCase(asTodoRepository(repository))

    expect(() => useCase.execute({ id: '' })).toThrow(ApplicationError)
    expect(repository.getById).not.toHaveBeenCalled()
  })

  it('delegates to repository.getById', async () => {
    const repository = createRepositoryMock()
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    repository.getById.mockResolvedValue(todo)
    const useCase = new GetTodoByIdUseCase(asTodoRepository(repository))

    await expect(useCase.execute({ id: 'id-1' })).resolves.toBe(todo)
    expect(repository.getById).toHaveBeenCalledWith('id-1')
  })
})
```

`tests/unit/usecases/list-todos.use-case.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ListTodosUseCase } from '../../../src/usecases/todo/ListTodosUseCase.js'
import {
  asTodoRepository,
  createRepositoryMock,
} from '../../support/repository-mock.js'

describe('ListTodosUseCase', () => {
  it('delegates to repository.list', async () => {
    const repository = createRepositoryMock()
    const todos = [Todo.create({ id: 'id-1', name: 'buy milk' })]
    repository.list.mockResolvedValue(todos)
    const useCase = new ListTodosUseCase(asTodoRepository(repository))

    await expect(useCase.execute()).resolves.toBe(todos)
    expect(repository.list).toHaveBeenCalledOnce()
  })
})
```

Verify: `pnpm test`. Commit.

## Task 4 - Controller unit tests

`tests/unit/controllers/create-todo.controller.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { CreateTodoController } from '../../../src/interfaces/controllers/CreateTodoController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('CreateTodoController', () => {
  it('responds 201 with the presented todo', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    const createTodoUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const controller = new CreateTodoController(createTodoUseCase)
    const reply = createReplyMock()

    await controller.handle({ body: { name: 'buy milk' } } as never, reply)

    expect(createTodoUseCase.execute).toHaveBeenCalledWith({ name: 'buy milk' })
    expect(reply.status).toHaveBeenCalledWith(201)
    expect(reply.send).toHaveBeenCalledWith({
      id: 'id-1',
      name: 'buy milk',
      createdAt: todo.createdAt.toISOString(),
      done: false,
    })
  })
})
```

`tests/unit/controllers/get-todo-by-id.controller.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { GetTodoByIdController } from '../../../src/interfaces/controllers/GetTodoByIdController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('GetTodoByIdController', () => {
  it('responds 200 with the presented todo', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    const getTodoByIdUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const controller = new GetTodoByIdController(getTodoByIdUseCase)
    const reply = createReplyMock()

    await controller.handle({ params: { id: 'id-1' } } as never, reply)

    expect(getTodoByIdUseCase.execute).toHaveBeenCalledWith({ id: 'id-1' })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
      id: 'id-1',
      name: 'buy milk',
      createdAt: todo.createdAt.toISOString(),
      done: false,
    })
  })
})
```

`tests/unit/controllers/list-todos.controller.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ListTodosController } from '../../../src/interfaces/controllers/ListTodosController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('ListTodosController', () => {
  it('responds 200 with the presented todo list', async () => {
    const todos = [
      Todo.create({ id: 'id-1', name: 'buy milk' }),
      Todo.create({ id: 'id-2', name: 'walk dog' }),
    ]
    const listTodosUseCase = { execute: vi.fn().mockResolvedValue(todos) }
    const controller = new ListTodosController(listTodosUseCase)
    const reply = createReplyMock()

    await controller.handle({} as never, reply)

    expect(listTodosUseCase.execute).toHaveBeenCalledOnce()
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith([
      {
        id: 'id-1',
        name: 'buy milk',
        createdAt: todos[0].createdAt.toISOString(),
        done: false,
      },
      {
        id: 'id-2',
        name: 'walk dog',
        createdAt: todos[1].createdAt.toISOString(),
        done: false,
      },
    ])
  })
})
```

Verify: `pnpm test`. Commit.

## Task 5 - Repository unit tests (mocked pg Pool)

`tests/unit/repositories/todo-repository.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { PgTodoRepository } from '../../../src/infrastructure/repositories/TodoRepository.js'

type QueryMock = ReturnType<typeof vi.fn>

function createPoolMock(): { query: QueryMock; pool: Pool } {
  const query = vi.fn()
  return { query, pool: { query } as unknown as Pool }
}

describe('PgTodoRepository', () => {
  it('save inserts and maps the returned row', async () => {
    const { query, pool } = createPoolMock()
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    query.mockResolvedValue({
      rows: [
        { id: 'id-1', name: 'buy milk', created_at: createdAt, done: false },
      ],
    })
    const repository = new PgTodoRepository(pool)

    const todo = await repository.save({ name: 'buy milk', done: false })

    expect(query).toHaveBeenCalledOnce()
    expect(query.mock.calls[0][0]).toContain('INSERT INTO todos')
    expect(query.mock.calls[0][1]).toEqual([
      'buy milk',
      expect.any(Date),
      false,
    ])
    expect(todo).toMatchObject({
      id: 'id-1',
      name: 'buy milk',
      createdAt,
      done: false,
    })
  })

  it('getById returns the mapped row', async () => {
    const { query, pool } = createPoolMock()
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    query.mockResolvedValue({
      rows: [
        { id: 'id-1', name: 'buy milk', created_at: createdAt, done: true },
      ],
    })
    const repository = new PgTodoRepository(pool)

    const todo = await repository.getById('id-1')

    expect(query.mock.calls[0][0]).toContain('WHERE id = $1')
    expect(query.mock.calls[0][1]).toEqual(['id-1'])
    expect(todo).toMatchObject({ id: 'id-1', done: true })
  })

  it('getById throws NOT_FOUND when there is no row', async () => {
    const { query, pool } = createPoolMock()
    query.mockResolvedValue({ rows: [] })
    const repository = new PgTodoRepository(pool)

    await expect(repository.getById('missing')).rejects.toBeInstanceOf(
      ApplicationError,
    )
    await expect(repository.getById('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('list maps every row', async () => {
    const { query, pool } = createPoolMock()
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    query.mockResolvedValue({
      rows: [
        { id: 'id-1', name: 'a', created_at: createdAt, done: false },
        { id: 'id-2', name: 'b', created_at: createdAt, done: true },
      ],
    })
    const repository = new PgTodoRepository(pool)

    const todos = await repository.list()

    expect(query.mock.calls[0][0]).toContain('ORDER BY created_at DESC')
    expect(todos).toHaveLength(2)
    expect(todos[0]).toMatchObject({ id: 'id-1' })
    expect(todos[1]).toMatchObject({ id: 'id-2' })
  })
})
```

Verify: `pnpm test`. Commit.

## Task 6 - E2E harness

`tests/support/build-test-app.ts`:

```ts
import type { FastifyInstance } from 'fastify'
import type { TodoRepository } from '../../src/domain/repositories/ITodoRepository.js'
import { CreateTodoController } from '../../src/interfaces/controllers/CreateTodoController.js'
import { GetTodoByIdController } from '../../src/interfaces/controllers/GetTodoByIdController.js'
import { ListTodosController } from '../../src/interfaces/controllers/ListTodosController.js'
import { buildServer } from '../../src/interfaces/http/server.js'
import { CreateTodoUseCase } from '../../src/usecases/todo/CreateTodoUseCase.js'
import { GetTodoByIdUseCase } from '../../src/usecases/todo/GetTodoByIdUseCase.js'
import { ListTodosUseCase } from '../../src/usecases/todo/ListTodosUseCase.js'

export function buildTestApp(repository: TodoRepository): FastifyInstance {
  return buildServer({
    createTodoController: new CreateTodoController(
      new CreateTodoUseCase(repository),
    ),
    getTodoByIdController: new GetTodoByIdController(
      new GetTodoByIdUseCase(repository),
    ),
    listTodosController: new ListTodosController(
      new ListTodosUseCase(repository),
    ),
  })
}
```

Verify: `pnpm typecheck:tests`. Commit.

## Task 7 - E2E todos routes

`tests/e2e/todos.routes.test.ts`:

```ts
import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { API_PREFIX } from '../../src/interfaces/http/routes/apiRoutes.js'
import { buildTestApp } from '../support/build-test-app.js'
import { FakeTodoRepository } from '../support/fake-todo-repository.js'

describe('todos routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = buildTestApp(new FakeTodoRepository())
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('POST /todos creates a todo', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'buy milk' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      name: 'buy milk',
      done: false,
    })
    expect(response.json().id).toEqual(expect.any(String))
  })

  it('POST /todos returns 400 when name is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: {},
    })

    expect(response.statusCode).toBe(400)
  })

  it('GET /todos/:id returns the created todo', async () => {
    const created = await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'buy milk' },
    })
    const { id } = created.json()

    const response = await app.inject({
      method: 'GET',
      url: `${API_PREFIX}/todos/${id}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ id, name: 'buy milk', done: false })
  })

  it('GET /todos/:id returns 404 for an unknown id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `${API_PREFIX}/todos/${randomUUID()}`,
    })

    expect(response.statusCode).toBe(404)
  })

  it('GET /todos lists todos', async () => {
    await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'first' },
    })
    await app.inject({
      method: 'POST',
      url: `${API_PREFIX}/todos`,
      payload: { name: 'second' },
    })

    const response = await app.inject({
      method: 'GET',
      url: `${API_PREFIX}/todos`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toHaveLength(2)
  })

  it('is not served without the version prefix', async () => {
    const response = await app.inject({ method: 'GET', url: '/todos' })
    expect(response.statusCode).toBe(404)
  })
})
```

Verify: `pnpm test`. Commit.

## Task 8 - E2E health routes + wrap-up

`tests/e2e/health.routes.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock('../../src/infrastructure/database/pool.js', () => ({
  pool: { query },
}))

import { buildTestApp } from '../support/build-test-app.js'
import { FakeTodoRepository } from '../support/fake-todo-repository.js'

describe('GET /health', () => {
  beforeEach(() => {
    query.mockReset()
  })

  it('returns 200 when the database responds', async () => {
    query.mockResolvedValue({ rows: [{ '?column?': 1 }] })
    const app = buildTestApp(new FakeTodoRepository())

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok', database: 'up' })
    await app.close()
  })

  it('returns 503 when the database fails', async () => {
    query.mockRejectedValue(new Error('connection refused'))
    const app = buildTestApp(new FakeTodoRepository())

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(503)
    expect(response.json()).toEqual({ status: 'error', database: 'down' })
    await app.close()
  })
})
```

Verify:

```bash
pnpm test
pnpm test:coverage
pnpm typecheck:tests
pnpm build
pnpm format:check
```

Commit.
