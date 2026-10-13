import { describe, expect, it, vi } from 'vitest'
import { Todo } from '../../../src/domain/entities/Todo.js'
import { ListTodosController } from '../../../src/interfaces/controllers/ListTodosController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('ListTodosController', () => {
  it('responds 200 with the presented todo list', async () => {
    const todos = [
      Todo.create({ id: 'id-1', name: 'buy milk' }),
      Todo.create({ id: 'id-2', name: 'walk dog' }),
    ]
    const listTodosUseCase = { execute: vi.fn().mockResolvedValue(todos) }
    const controller = new ListTodosController(listTodosUseCase)
    const reply = createReplyMock()

    await controller.handle({} as never, reply)

    expect(listTodosUseCase.execute).toHaveBeenCalledOnce()
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith([
      {
        id: 'id-1',
        name: 'buy milk',
        createdAt: todos[0].createdAt.toISOString(),
        done: false,
      },
      {
        id: 'id-2',
        name: 'walk dog',
        createdAt: todos[1].createdAt.toISOString(),
        done: false,
      },
    ])
  })
})
