import { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { FinishTodoUseCase } from '../../../../usecases/todo/FinishTodoUseCase.js'

export function makeFinishTodoUseCase(
  repository: TodoRepository,
): FinishTodoUseCase {
  return new FinishTodoUseCase(repository)
}
