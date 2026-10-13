import { Todo } from '../../entities/Todo.js'

export interface ListTodosContract {
  execute(): Promise<Todo[]>
}
