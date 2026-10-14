import type { CreateTodoContract } from '../../../domain/contracts/todo/CreateTodoContract.js'
import { TodoPresenter } from '../../presenters/TodoPresenter.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class CreateTodoHandler {
  constructor(private readonly createTodoUseCase: CreateTodoContract) {}

  handle: TodoServiceServer['createTodo'] = async (call, callback) => {
    try {
      const todo = await this.createTodoUseCase.execute({
        name: call.request.name,
      })

      callback(null, TodoPresenter.toJSON(todo))
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
