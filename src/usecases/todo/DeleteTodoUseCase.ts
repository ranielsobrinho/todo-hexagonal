import { DeleteTodoContract } from '../../domain/contracts/todo/DeleteTodoContract.js'
import { TodoRepository } from '../../domain/repositories/ITodoRepository.js'

export class DeleteTodoUseCase implements DeleteTodoContract {
  constructor(private readonly todosRepository: TodoRepository) {}

  async execute(id: string): Promise<void> {
    return this.todosRepository.delete(id)
  }
}
