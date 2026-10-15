import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { DeleteTodoUseCase } from '../../../../usecases/todo/DeleteTodoUseCase.js'

export function makeDeleteTodoUseCase(
  repository: TodoRepository,
): DeleteTodoUseCase {
  return new DeleteTodoUseCase(repository)
}
