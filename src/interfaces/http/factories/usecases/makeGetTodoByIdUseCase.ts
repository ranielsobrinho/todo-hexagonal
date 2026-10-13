import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { GetTodoByIdUseCase } from '../../../../usecases/todo/GetTodoByIdUseCase.js'

export function makeGetTodoByIdUseCase(
  repository: TodoRepository,
): GetTodoByIdUseCase {
  return new GetTodoByIdUseCase(repository)
}
