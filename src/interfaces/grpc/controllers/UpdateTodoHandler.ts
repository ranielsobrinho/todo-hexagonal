import type { UpdateTodoContract } from '../../../domain/contracts/todo/UpdateTodoContract.js'
import { TodoPresenter } from '../../presenters/TodoPresenter.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class UpdateTodoHandler {
  constructor(private readonly updateTodoUseCase: UpdateTodoContract) {}

  handle: TodoServiceServer['updateTodo'] = async (call, callback) => {
    try {
      const todo = await this.updateTodoUseCase.execute({
        id: call.request.id,
        name: call.request.name,
      })

      callback(null, TodoPresenter.toJSON(todo))
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
