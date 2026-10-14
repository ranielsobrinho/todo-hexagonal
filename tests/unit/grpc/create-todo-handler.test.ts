import { status } from '@grpc/grpc-js'
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { CreateTodoHandler } from '../../../src/interfaces/grpc/controllers/CreateTodoHandler.js'
import {
  createCallbackMock,
  createCallMock,
} from '../../support/grpc-handler-mock.js'

describe('CreateTodoHandler', () => {
  it('calls the use case and responds with the presented todo', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    const createTodoUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const handler = new CreateTodoHandler(createTodoUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ name: 'buy milk' }), callback)

    expect(createTodoUseCase.execute).toHaveBeenCalledWith({ name: 'buy milk' })
    expect(callback).toHaveBeenCalledWith(null, {
      id: 'id-1',
      name: 'buy milk',
      createdAt: todo.createdAt.toISOString(),
      done: false,
    })
  })

  it('maps a domain error to a grpc status instead of throwing', async () => {
    const createTodoUseCase = {
      execute: vi
        .fn()
        .mockRejectedValue(
          new ApplicationError('Name is required', 'VALIDATION_ERROR'),
        ),
    }
    const handler = new CreateTodoHandler(createTodoUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ name: '' }), callback)

    expect(callback).toHaveBeenCalledWith({
      code: status.INVALID_ARGUMENT,
      details: 'Name is required',
    })
  })
})
