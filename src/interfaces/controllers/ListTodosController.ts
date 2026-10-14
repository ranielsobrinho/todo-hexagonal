import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListTodosContract } from '../../domain/contracts/todo/ListTodosContract.js'
import { TodoPresenter } from '../presenters/TodoPresenter.js'

type ListTodosQuery = {
  limit?: number
  offset?: number
  done?: boolean
}

export class ListTodosController {
  constructor(private readonly listTodosUseCase: ListTodosContract) {}

  handle = async (
    request: FastifyRequest<{ Querystring: ListTodosQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const query = request.query ?? {}
    const todos = await this.listTodosUseCase.execute({
      limit: query.limit,
      offset: query.offset,
      done: query.done === true ? undefined : false,
    })
    await reply.status(200).send(TodoPresenter.toJSONList(todos))
  }
}
