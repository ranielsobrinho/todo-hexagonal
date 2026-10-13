import { ListTodosContract } from '../../domain/contracts/todo/ListTodosContract.js'
import { Todo } from '../../domain/entities/Todo.js'
import { TodoRepository } from '../../domain/repositories/ITodoRepository.js'

export class ListTodosUseCase implements ListTodosContract {
  constructor(private readonly todosRepository: TodoRepository) {}

  execute(): Promise<Todo[]> {
    return this.todosRepository.list()
  }
}
