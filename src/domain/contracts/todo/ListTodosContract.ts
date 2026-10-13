import { Todo } from '../../entities/Todo.js'
import type { ListTodosParams } from '../../repositories/ITodoRepository.js'

export interface ListTodosContract {
  execute(params?: ListTodosParams): Promise<Todo[]>
}
