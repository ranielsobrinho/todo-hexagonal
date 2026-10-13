import { randomUUID } from 'node:crypto'
import {
  credentials,
  ServerCredentials,
  status,
  type Server,
  type ServiceError,
} from '@grpc/grpc-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { makeTodoHandlers } from '../../src/interfaces/grpc/factories/makeTodoHandlers.js'
import {
  TodoServiceClient,
  type Todo,
} from '../../src/interfaces/grpc/generated/proto/todo.js'
import { buildGrpcServer } from '../../src/interfaces/grpc/server.js'
import { FakeTodoRepository } from '../support/fake-todo-repository.js'

const unary = <Response>(
  call: (
    callback: (error: ServiceError | null, response?: Response) => void,
  ) => void,
): Promise<Response> =>
  new Promise((resolve, reject) =>
    call((error, response) =>
      error ? reject(error) : resolve(response as Response),
    ),
  )

describe('grpc todo service', () => {
  let server: Server
  let client: TodoServiceClient

  beforeAll(async () => {
    server = buildGrpcServer(makeTodoHandlers(new FakeTodoRepository()))

    const port = await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        '127.0.0.1:0',
        ServerCredentials.createInsecure(),
        (error, boundPort) => (error ? reject(error) : resolve(boundPort)),
      )
    })

    client = new TodoServiceClient(
      `127.0.0.1:${port}`,
      credentials.createInsecure(),
    )
  })

  afterAll(() => {
    client.close()
    server.forceShutdown()
  })

  it('creates a todo and retrieves it by id', async () => {
    const created = await unary<Todo>((callback) =>
      client.createTodo({ name: 'buy milk' }, callback),
    )

    expect(created).toMatchObject({ name: 'buy milk', done: false })
    expect(created.id).toEqual(expect.any(String))

    const found = await unary<Todo>((callback) =>
      client.getTodoById({ id: created.id }, callback),
    )

    expect(found).toEqual(created)
  })

  it('lists todos with pagination', async () => {
    for (const name of ['first', 'second', 'third']) {
      await unary<Todo>((callback) => client.createTodo({ name }, callback))
    }

    const all = await unary<{ todos: Todo[] }>((callback) =>
      client.listTodos({ limit: 0, offset: 0 }, callback),
    )
    const limited = await unary<{ todos: Todo[] }>((callback) =>
      client.listTodos({ limit: 2, offset: 0 }, callback),
    )

    expect(all.todos.length).toBeGreaterThanOrEqual(3)
    expect(limited.todos).toHaveLength(2)
  })

  it('returns NOT_FOUND for an unknown id', async () => {
    await expect(
      unary((callback) => client.getTodoById({ id: randomUUID() }, callback)),
    ).rejects.toMatchObject({ code: status.NOT_FOUND })
  })

  it('returns INVALID_ARGUMENT for an empty name', async () => {
    await expect(
      unary((callback) => client.createTodo({ name: '' }, callback)),
    ).rejects.toMatchObject({ code: status.INVALID_ARGUMENT })
  })

  it('returns INVALID_ARGUMENT for an out-of-range limit', async () => {
    await expect(
      unary((callback) =>
        client.listTodos({ limit: 200, offset: 0 }, callback),
      ),
    ).rejects.toMatchObject({ code: status.INVALID_ARGUMENT })
  })
})
