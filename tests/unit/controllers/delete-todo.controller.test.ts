import { describe, expect, it, vi } from 'vitest'
import { DeleteTodoController } from '../../../src/interfaces/controllers/DeleteTodoController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('DeleteTodoController', () => {
  it('responds 204 with no content', async () => {
    const deleteTodoUseCase = { execute: vi.fn().mockResolvedValue(undefined) }
    const controller = new DeleteTodoController(deleteTodoUseCase)
    const reply = createReplyMock()

    await controller.handle({ params: { id: 'id-1' } } as never, reply)

    expect(deleteTodoUseCase.execute).toHaveBeenCalledWith('id-1')
    expect(reply.status).toHaveBeenCalledWith(204)
    expect(reply.send).toHaveBeenCalledWith()
  })
})
