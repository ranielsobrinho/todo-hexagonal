import { Todo } from '../../entities/Todo.js'

export type GetTodoByIdInput = {
  id: string
}

export interface GetTodoByIdContract {
  execute(input: GetTodoByIdInput): Promise<Todo>
}
