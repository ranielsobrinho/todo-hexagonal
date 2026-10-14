import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { UpdateTodoController } from '../../../src/interfaces/controllers/UpdateTodoController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('UpdateTodoController', () => {
  it('responds 200 with the presented todo', async () => {
    const todo = Todo.create({ id: 'id-1', name: 'renamed' })
    const updateTodoUseCase = { execute: vi.fn().mockResolvedValue(todo) }
    const controller = new UpdateTodoController(updateTodoUseCase)
    const reply = createReplyMock()

    await controller.handle(
      { params: { id: 'id-1' }, body: { name: 'renamed' } } as never,
      reply,
    )

    expect(updateTodoUseCase.execute).toHaveBeenCalledWith({
      id: 'id-1',
      name: 'renamed',
    })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({
      id: 'id-1',
      name: 'renamed',
      createdAt: todo.createdAt.toISOString(),
      done: false,
    })
  })
})
