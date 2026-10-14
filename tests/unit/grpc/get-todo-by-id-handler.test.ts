import { status } from '@grpc/grpc-js'
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { GetTodoByIdHandler } from '../../../src/interfaces/grpc/controllers/GetTodoByIdHandler.js'
import {
  createCallbackMock,
  createCallMock,
} from '../../support/grpc-handler-mock.js'

describe('GetTodoByIdHandler', () => {
  it('calls the use case with the requested id and presents the todo', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    const getTodoByIdUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const handler = new GetTodoByIdHandler(getTodoByIdUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ id: 'id-1' }), callback)

    expect(getTodoByIdUseCase.execute).toHaveBeenCalledWith({ id: 'id-1' })
    expect(callback).toHaveBeenCalledWith(null, {
      id: 'id-1',
      name: 'buy milk',
      createdAt: todo.createdAt.toISOString(),
      done: false,
    })
  })

  it('maps a NOT_FOUND domain error to the NOT_FOUND status', async () => {
    const getTodoByIdUseCase = {
      execute: vi
        .fn()
        .mockRejectedValue(
          new ApplicationError('Todo with id id-1 was not found', 'NOT_FOUND'),
        ),
    }
    const handler = new GetTodoByIdHandler(getTodoByIdUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ id: 'id-1' }), callback)

    expect(callback).toHaveBeenCalledWith({
      code: status.NOT_FOUND,
      details: 'Todo with id id-1 was not found',
    })
  })
})
