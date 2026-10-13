import type { ListTodosContract } from '../../../domain/contracts/todo/ListTodosContract.js'
import { ApplicationError } from '../../../domain/errors/ApplicationError.js'
import { TodoPresenter } from '../../presenters/TodoPresenter.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class ListTodosHandler {
  constructor(private readonly listTodosUseCase: ListTodosContract) {}

  handle: TodoServiceServer['listTodos'] = async (call, callback) => {
    try {
      const { limit: rawLimit, offset: rawOffset } = call.request
      const limit = rawLimit === 0 ? undefined : rawLimit
      const offset = rawOffset === 0 ? undefined : rawOffset

      if (limit !== undefined && (limit < 1 || limit > 100)) {
        throw new ApplicationError(
          'limit must be between 1 and 100',
          'VALIDATION_ERROR',
        )
      }

      if (offset !== undefined && offset < 0) {
        throw new ApplicationError(
          'offset must be greater than or equal to 0',
          'VALIDATION_ERROR',
        )
      }

      const todos = await this.listTodosUseCase.execute({ limit, offset })
      callback(null, { todos: TodoPresenter.toJSONList(todos) })
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
