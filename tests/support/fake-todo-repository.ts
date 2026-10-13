import { randomUUID } from 'node:crypto'
import { Todo } from '../../src/domain/entities/Todo.js'
import { ApplicationError } from '../../src/domain/errors/ApplicationError.js'
import type {
  ListTodosParams,
  TodoParam,
  TodoRepository,
} from '../../src/domain/repositories/ITodoRepository.js'

export class FakeTodoRepository implements TodoRepository {
  private readonly todos = new Map<string, Todo>()

  async save(params: TodoParam): Promise<Todo> {
    const todo = new Todo(
      randomUUID(),
      params.name,
      params.createdAt ?? new Date(),
      params.done ?? false,
    )
    this.todos.set(todo.id, todo)
    return todo
  }

  async getById(id: string): Promise<Todo> {
    const todo = this.todos.get(id)
    if (!todo) {
      throw new ApplicationError(
        `Todo with id ${id} was not found`,
        'NOT_FOUND',
      )
    }
    return todo
  }

  async list(params: ListTodosParams = {}): Promise<Todo[]> {
    const limit = params.limit ?? 50
    const offset = params.offset ?? 0

    return [...this.todos.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit)
  }
}
