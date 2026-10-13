import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetTodoByIdContract } from '../../domain/contracts/todo/GetTodoByIdContract.js'
import { TodoPresenter } from '../presenters/TodoPresenter.js'

export class GetTodoByIdController {
  constructor(private readonly getTodoByIdUseCase: GetTodoByIdContract) {}

  handle = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const { id } = request.params
    const todo = await this.getTodoByIdUseCase.execute({ id })

    await reply.status(200).send(TodoPresenter.toJSON(todo))
  }
}
