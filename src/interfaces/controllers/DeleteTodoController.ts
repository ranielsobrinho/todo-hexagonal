import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteTodoContract } from '../../domain/contracts/todo/DeleteTodoContract.js'

type DeleteTodoParam = {
  id: string
}

export class DeleteTodoController {
  constructor(private readonly deleteTodoUseCase: DeleteTodoContract) {}

  handle = async (
    request: FastifyRequest<{ Params: DeleteTodoParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const id = request.params.id

    await this.deleteTodoUseCase.execute(id)

    await reply.status(204).send()
  }
}
