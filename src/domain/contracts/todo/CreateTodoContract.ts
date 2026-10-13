import { Todo } from '../../entities/Todo.js'

export type CreateTodoInput = {
  name: string
}

export interface CreateTodoContract {
  execute(input: CreateTodoInput): Promise<Todo>
}
