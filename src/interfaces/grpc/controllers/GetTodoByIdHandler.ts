import type { GetTodoByIdContract } from '../../../domain/contracts/todo/GetTodoByIdContract.js'
import { TodoPresenter } from '../../presenters/TodoPresenter.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class GetTodoByIdHandler {
  constructor(private readonly getTodoByIdUseCase: GetTodoByIdContract) {}

  handle: TodoServiceServer['getTodoById'] = async (call, callback) => {
    try {
      const todo = await this.getTodoByIdUseCase.execute({
        id: call.request.id,
      })

      callback(null, TodoPresenter.toJSON(todo))
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
