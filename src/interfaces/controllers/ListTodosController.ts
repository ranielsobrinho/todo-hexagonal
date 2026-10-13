import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListTodosContract } from '../../domain/contracts/todo/ListTodosContract.js'
import { TodoPresenter } from '../presenters/TodoPresenter.js'

export class ListTodosController {
  constructor(private readonly listTodosUseCase: ListTodosContract) {}

  handle = async (
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const todos = await this.listTodosUseCase.execute()
    await reply.status(200).send(TodoPresenter.toJSONList(todos))
  }
}
