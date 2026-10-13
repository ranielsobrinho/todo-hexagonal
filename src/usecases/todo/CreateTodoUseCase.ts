import {
  CreateTodoContract,
  CreateTodoInput,
} from '../../domain/contracts/todo/CreateTodoContract.js'
import { Todo } from '../../domain/entities/Todo.js'
import { ApplicationError } from '../../domain/errors/ApplicationError.js'
import { TodoRepository } from '../../domain/repositories/ITodoRepository.js'

export class CreateTodoUseCase implements CreateTodoContract {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute({ name }: CreateTodoInput): Promise<Todo> {
    if (!name) {
      throw new ApplicationError('Name is required', 'VALIDATION_ERROR')
    }

    return this.todoRepository.save({ name, done: false })
  }
}
