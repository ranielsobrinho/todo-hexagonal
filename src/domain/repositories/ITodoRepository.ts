import { Todo } from '../entities/Todo.js'

export interface TodoRepository {
  save(params: TodoParam): Promise<Todo>
  getById(id: string): Promise<Todo>
  list(params?: ListTodosParams): Promise<Todo[]>
}

export type TodoParam = {
  name: string
  createdAt?: Date
  done?: boolean
}

export type ListTodosParams = {
  limit?: number
  offset?: number
}
