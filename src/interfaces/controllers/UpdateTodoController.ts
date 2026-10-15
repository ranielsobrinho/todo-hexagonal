import { FastifyReply, FastifyRequest } from 'fastify'
import { UpdateTodoContract } from '../../domain/contracts/todo/UpdateTodoContract.js'
import { TodoPresenter } from '../presenters/TodoPresenter.js'

type UpdateTodoBody = {
  name: string
}
export class UpdateTodoController {
  constructor(private readonly updateTodoUseCase: UpdateTodoContract) {}

  handle = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: UpdateTodoBody
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const updatedTodo = await this.updateTodoUseCase.execute({
      id: request.params.id,
      name: request.body.name,
    })

    await reply.status(200).send(TodoPresenter.toJSON(updatedTodo))
  }
}
