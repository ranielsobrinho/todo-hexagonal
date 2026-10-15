import { Todo } from '../../entities/Todo.js'

export type UpdateTodoInput = {
  id: string
  name: string
}

export interface UpdateTodoContract {
  execute(input: UpdateTodoInput): Promise<Todo>
}
