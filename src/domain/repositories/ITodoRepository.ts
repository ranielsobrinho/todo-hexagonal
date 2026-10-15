import { Todo } from '../entities/Todo.js'

export interface TodoRepository {
  save(params: TodoParam): Promise<Todo>
  getById(id: string): Promise<Todo>
  list(params?: ListTodosParams): Promise<Todo[]>
  update(id: string, params: TodoParam): Promise<Todo>
  delete(id: string): Promise<void>
  finish(id: string): Promise<void>
}

export type TodoParam = {
  name: string
  createdAt?: Date
  done?: boolean
}

export type ListTodosParams = {
  limit?: number
  offset?: number
  done?: boolean
}
