import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../../src/domain/errors/ApplicationError.js'
import { CreateTodosStreamHandler } from '../../../src/interfaces/grpc/controllers/CreateTodosStreamHandler.js'
import { createStreamCallMock } from '../../support/grpc-handler-mock.js'

describe('CreateTodosStreamHandler', () => {
  it('creates each streamed todo without writing failures', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'buy milk' })
    const createTodoUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const handler = new CreateTodosStreamHandler(createTodoUseCase)
    const call = createStreamCallMock()

    handler.handle(call as never)
    call.emitData({ name: 'buy milk' })
    call.emitData({ name: 'walk the dog' })
    await call.emitEnd()

    expect(createTodoUseCase.execute).toHaveBeenCalledWith({
      name: 'buy milk',
    })
    expect(createTodoUseCase.execute).toHaveBeenCalledWith({
      name: 'walk the dog',
    })
    expect(call.write).not.toHaveBeenCalled()
    expect(call.end).toHaveBeenCalled()
  })

  it('writes a FailedTodo with the reason when creation fails', async () => {
    const createTodoUseCase = {
      execute: vi
        .fn()
        .mockRejectedValue(
          new ApplicationError('Name is required', 'VALIDATION_ERROR'),
        ),
    }
    const handler = new CreateTodosStreamHandler(createTodoUseCase)
    const call = createStreamCallMock()

    handler.handle(call as never)
    call.emitData({ name: '' })
    await call.emitEnd()

    expect(call.write).toHaveBeenCalledWith({
      name: '',
      reason: 'Name is required',
    })
  })

  it('keeps processing the stream after a failure', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'second' })
    const createTodoUseCase = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(
          new ApplicationError('Name is required', 'VALIDATION_ERROR'),
        )
        .mockResolvedValueOnce(todo),
    }
    const handler = new CreateTodosStreamHandler(createTodoUseCase)
    const call = createStreamCallMock()

    handler.handle(call as never)
    call.emitData({ name: '' })
    call.emitData({ name: 'second' })
    await call.emitEnd()

    expect(call.write).toHaveBeenCalledTimes(1)
    expect(call.write).toHaveBeenCalledWith({
      name: '',
      reason: 'Name is required',
    })
    expect(createTodoUseCase.execute).toHaveBeenLastCalledWith({
      name: 'second',
    })
  })
})
