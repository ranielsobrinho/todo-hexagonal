import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { ListTodosUseCase } from '../../../../usecases/todo/ListTodosUseCase.js'

export function makeListTodosUseCase(
  repository: TodoRepository,
): ListTodosUseCase {
  return new ListTodosUseCase(repository)
}
