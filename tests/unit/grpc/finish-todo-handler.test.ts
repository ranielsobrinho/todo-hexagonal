import { status } from '@grpc/grpc-js'
import { describe, expect, it, vi } from 'vitest'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { FinishTodoHandler } from '../../../src/interfaces/grpc/controllers/FinishTodoHandler.js'
import {
  createCallbackMock,
  createCallMock,
} from '../../support/grpc-handler-mock.js'

describe('FinishTodoHandler', () => {
  it('finishes the todo and responds with an empty message', async () => {
    const finishTodoUseCase = { execute: vi.fn().mockResolvedValue(undefined) }
    const handler = new FinishTodoHandler(finishTodoUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ id: 'id-1' }), callback)

    expect(finishTodoUseCase.execute).toHaveBeenCalledWith('id-1')
    expect(callback).toHaveBeenCalledWith(null, {})
  })

  it('maps a domain error to a grpc status instead of throwing', async () => {
    const finishTodoUseCase = {
      execute: vi
        .fn()
        .mockRejectedValue(
          new ApplicationError('Todo with id id-1 was not found', 'NOT_FOUND'),
        ),
    }
    const handler = new FinishTodoHandler(finishTodoUseCase)
    const callback = createCallbackMock()

    await handler.handle(createCallMock({ id: 'id-1' }), callback)

    expect(callback).toHaveBeenCalledWith({
      code: status.NOT_FOUND,
      details: 'Todo with id id-1 was not found',
    })
  })
})
