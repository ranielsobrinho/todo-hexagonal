import { Todo } from '../entities/Todo.js'

export interface TodoRepository {
  save(params: TodoParam): Promise<Todo>
  getById(id: string): Promise<Todo>
  list(): Promise<Todo[]>
}

export type TodoParam = {
  name: string
  createdAt?: Date
  done?: boolean
}
