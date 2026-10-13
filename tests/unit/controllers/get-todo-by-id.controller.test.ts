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
