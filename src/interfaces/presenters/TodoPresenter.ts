import type { Todo } from '../../domain/entities/Todo.js'

export type TodoResponse = {
  id: string
  name: string
  createdAt: string
  done: boolean
}

export const TodoPresenter = {
  toJSON(todo: Todo): TodoResponse {
    return {
      id: todo.id,
      name: todo.name,
      createdAt: todo.createdAt.toISOString(),
      done: todo.done,
    }
  },
  toJSONList(todos: Todo[]): TodoResponse[] {
    return todos.map((todo) => TodoPresenter.toJSON(todo))
  },
}
