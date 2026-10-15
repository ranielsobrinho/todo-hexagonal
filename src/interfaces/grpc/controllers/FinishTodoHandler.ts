import type { FinishTodoContract } from '../../../domain/contracts/todo/FinishTodoContract.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class FinishTodoHandler {
  constructor(private readonly finishTodoUseCase: FinishTodoContract) {}

  handle: TodoServiceServer['finishTodo'] = async (call, callback) => {
    try {
      await this.finishTodoUseCase.execute(call.request.id)

      callback(null, {})
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
