import { status } from '@grpc/grpc-js'
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ListTodosHandler } from '../../../src/interfaces/grpc/controllers/ListTodosHandler.js'
import {
  createCallbackMock,
  createCallMock,
} from '../../support/grpc-handler-mock.js'

describe('ListTodosHandler', () => {
  it('treats zero limit and offset as absent', async () => {
    const listTodosUseCase = { execute: vi.fn().mockResolvedValue([]) }
    const handler = new ListTodosHandler(listTodosUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ limit: 0, offset: 0 }), callback)

    expect(listTodosUseCase.execute).toHaveBeenCalledWith({
      limit: undefined,
      offset: undefined,
    })
    expect(callback).toHaveBeenCalledWith(null, { todos: [] })
  })

  it('forwards the provided pagination and wraps the list', async () => {
    const todos = [Todo.create({ id: 'id-1', name: 'buy milk' })]
    const listTodosUseCase = { execute: vi.fn().mockResolvedValue(todos) }
    const handler = new ListTodosHandler(listTodosUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ limit: 10, offset: 5 }), callback)

    expect(listTodosUseCase.execute).toHaveBeenCalledWith({
      limit: 10,
      offset: 5,
    })
    expect(callback).toHaveBeenCalledWith(null, {
      todos: [
        {
          id: 'id-1',
          name: 'buy milk',
          createdAt: todos[0].createdAt.toISOString(),
          done: false,
        },
      ],
    })
  })

  it('rejects an out-of-range limit without calling the use case', async () => {
    const listTodosUseCase = { execute: vi.fn() }
    const handler = new ListTodosHandler(listTodosUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ limit: 200, offset: 0 }), callback)

    expect(listTodosUseCase.execute).not.toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith({
      code: status.INVALID_ARGUMENT,
      details: 'limit must be between 1 and 100',
    })
  })

  it('rejects a negative offset', async () => {
    const listTodosUseCase = { execute: vi.fn() }
    const handler = new ListTodosHandler(listTodosUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ limit: 0, offset: -1 }), callback)

    expect(listTodosUseCase.execute).not.toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith({
      code: status.INVALID_ARGUMENT,
      details: 'offset must be greater than or equal to 0',
    })
  })
})
