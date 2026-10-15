import { status } from '@grpc/grpc-js'
import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { UpdateTodoHandler } from '../../../src/interfaces/grpc/controllers/UpdateTodoHandler.js'
import {
  createCallbackMock,
  createCallMock,
} from '../../support/grpc-handler-mock.js'

describe('UpdateTodoHandler', () => {
  it('calls the use case and responds with the presented todo', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'buy eggs' })
    const updateTodoUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const handler = new UpdateTodoHandler(updateTodoUseCase)
    const callback = createCallbackMock()

    await handler.handle(
      createCallMock({ id: 'id-1', name: 'buy eggs' }),
      callback,
    )

    expect(updateTodoUseCase.execute).toHaveBeenCalledWith({
      id: 'id-1',
      name: 'buy eggs',
    })
    expect(callback).toHaveBeenCalledWith(null, {
      id: 'id-1',
      name: 'buy eggs',
      createdAt: todo.createdAt.toISOString(),
      done: false,
    })
  })

  it('maps a domain error to a grpc status instead of throwing', async () => {
    const updateTodoUseCase = {
      execute: vi
        .fn()
        .mockRejectedValue(
          new ApplicationError('Name is required', 'VALIDATION_ERROR'),
        ),
    }
    const handler = new UpdateTodoHandler(updateTodoUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ id: 'id-1', name: '' }), callback)

    expect(callback).toHaveBeenCalledWith({
      code: status.INVALID_ARGUMENT,
      details: 'Name is required',
    })
  })
})
