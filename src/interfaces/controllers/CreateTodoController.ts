import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateTodoContract } from '../../domain/contracts/todo/CreateTodoContract.js'
import { TodoPresenter } from '../presenters/TodoPresenter.js'

type CreateTodoBody = {
  name: string
}

export class CreateTodoController {
  constructor(private readonly createTodoUseCase: CreateTodoContract) {}

  handle = async (
    request: FastifyRequest<{ Body: CreateTodoBody }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const todo = await this.createTodoUseCase.execute({
      name: request.body.name,
    })

    await reply.status(201).send(TodoPresenter.toJSON(todo))
  }
}
