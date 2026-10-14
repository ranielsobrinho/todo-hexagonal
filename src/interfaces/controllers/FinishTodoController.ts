import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FinishTodoContract } from '../../domain/contracts/todo/FinishTodoContract.js'

export class FinishTodoController {
  constructor(private readonly finishTodoUseCase: FinishTodoContract) {}

  handle = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = request.params.id
    await this.finishTodoUseCase.execute(id)

    await reply.status(204).send()
  }
}
