import { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { UpdateTodoUseCase } from '../../../../usecases/todo/UpdateTodoUseCase.js'

export function makeUpdateTodoUseCase(
  repository: TodoRepository,
): UpdateTodoUseCase {
  return new UpdateTodoUseCase(repository)
}
