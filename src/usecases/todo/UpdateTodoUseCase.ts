import {
  UpdateTodoContract,
  UpdateTodoInput,
} from '../../domain/contracts/todo/UpdateTodoContract.js'
import { Todo } from '../../domain/entities/Todo.js'
import { ApplicationError } from '../../domain/errors/ApplicationError.js'
import { TodoRepository } from '../../domain/repositories/ITodoRepository.js'

export class UpdateTodoUseCase implements UpdateTodoContract {
  constructor(private readonly todosRepository: TodoRepository) {}

  async execute(input: UpdateTodoInput): Promise<Todo> {
    const { id, name } = input
    if (!id) {
      throw new ApplicationError('Id is required', 'VALIDATION_ERROR')
    }
    if (!name) {
      throw new ApplicationError('Name is required', 'VALIDATION_ERROR')
    }

    return this.todosRepository.update(id, { name })
  }
}
