import type { Pool } from 'pg'
import { pool } from '../database/pool.js'
import { Todo } from '../../domain/entities/Todo.js'
import { ApplicationError } from '../../domain/errors/ApplicationError.js'
import type {
  TodoParam,
  TodoRepository,
} from '../../domain/repositories/ITodoRepository.js'

type TodoRow = {
  id: string
  name: string
  created_at: Date
  done: boolean
}

function toTodo(row: TodoRow): Todo {
  return new Todo(row.id, row.name, row.created_at, row.done)
}

export class PgTodoRepository implements TodoRepository {
  constructor(private readonly db: Pool = pool) {}

  async save(params: TodoParam): Promise<Todo> {
    const { rows } = await this.db.query<TodoRow>(
      `INSERT INTO todos (name, created_at, done)
       VALUES ($1, $2, $3)
       RETURNING id, name, created_at, done`,
      [params.name, params.createdAt ?? new Date(), params.done ?? false],
    )

    return toTodo(rows[0])
  }

  async getById(id: string): Promise<Todo> {
    const { rows } = await this.db.query<TodoRow>(
      `SELECT id, name, created_at, done FROM todos WHERE id = $1`,
      [id],
    )

    if (!rows[0]) {
      throw new ApplicationError(
        `Todo with id ${id} was not found`,
        'NOT_FOUND',
      )
    }

    return toTodo(rows[0])
  }

  async list(): Promise<Todo[]> {
    const { rows } = await this.db.query<TodoRow>(
      `SELECT id, name, created_at, done FROM todos ORDER BY created_at DESC`,
    )

    return rows.map(toTodo)
  }
}
