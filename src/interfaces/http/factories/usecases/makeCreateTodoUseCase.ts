import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { CreateTodoUseCase } from '../../../../usecases/todo/CreateTodoUseCase.js'

export function makeCreateTodoUseCase(
  repository: TodoRepository,
): CreateTodoUseCase {
  return new CreateTodoUseCase(repository)
}
