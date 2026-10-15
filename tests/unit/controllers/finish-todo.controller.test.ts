import { describe, expect, it, vi } from 'vitest'
import { FinishTodoController } from '../../../src/interfaces/controllers/FinishTodoController.js'
import { createReplyMock } from '../../support/reply-mock.js'

describe('FinishTodoController', () => {
  it('responds 204 with no content', async () => {
    const finishTodoUseCase = { execute: vi.fn().mockResolvedValue(undefined) }
    const controller = new FinishTodoController(finishTodoUseCase)
    const reply = createReplyMock()

    await controller.handle({ params: { id: 'id-1' } } as never, reply)

    expect(finishTodoUseCase.execute).toHaveBeenCalledWith('id-1')
    expect(reply.status).toHaveBeenCalledWith(204)
    expect(reply.send).toHaveBeenCalledWith()
  })
})
