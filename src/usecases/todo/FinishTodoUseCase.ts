import { FinishTodoContract } from '../../domain/contracts/todo/FinishTodoContract.js'
import { TodoRepository } from '../../domain/repositories/ITodoRepository.js'

export class FinishTodoUseCase implements FinishTodoContract {
  constructor(private readonly todosRepository: TodoRepository) {}

  async execute(id: string): Promise<void> {
    return this.todosRepository.finish(id)
  }
}
