import {
  GetTodoByIdContract,
  GetTodoByIdInput,
} from '../../domain/contracts/todo/GetTodoByIdContract.js'
import { Todo } from '../../domain/entities/Todo.js'
import { ApplicationError } from '../../domain/errors/ApplicationError.js'
import { TodoRepository } from '../../domain/repositories/ITodoRepository.js'

export class GetTodoByIdUseCase implements GetTodoByIdContract {
  constructor(private readonly todoRepository: TodoRepository) {}

  execute(input: GetTodoByIdInput): Promise<Todo> {
    const { id } = input
    if (!id) {
      throw new ApplicationError('Id is required', 'VALIDATION_ERROR')
    }

    return this.todoRepository.getById(id)
  }
}
