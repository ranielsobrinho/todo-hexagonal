import type { DeleteTodoContract } from '../../../domain/contracts/todo/DeleteTodoContract.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class DeleteTodoHandler {
  constructor(private readonly deleteTodoUseCase: DeleteTodoContract) {}

  handle: TodoServiceServer['deleteTodo'] = async (call, callback) => {
    try {
      await this.deleteTodoUseCase.execute(call.request.id)

      callback(null, {})
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
