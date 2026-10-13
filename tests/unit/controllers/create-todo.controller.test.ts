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
