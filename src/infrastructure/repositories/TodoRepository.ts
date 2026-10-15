import type { Pool } from 'pg'
import { pool } from '../database/pool.js'
import { Todo } from '../../domain/entities/Todo.js'
import { ApplicationError } from '../../domain/errors/ApplicationError.js'
import type {
  ListTodosParams,
  TodoParam,
  TodoRepository,
} from '../../domain/repositories/ITodoRepository.js'

const DEFAULT_LIST_LIMIT = 50
const DEFAULT_LIST_OFFSET = 0

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

  async list(params: ListTodosParams = {}): Promise<Todo[]> {
    const limit = params.limit ?? DEFAULT_LIST_LIMIT
    const offset = params.offset ?? DEFAULT_LIST_OFFSET

    const values: Array<number | boolean> = [limit, offset]
    let whereClause = ''
    if (params.done !== undefined) {
      values.push(params.done)
      whereClause = `WHERE done = $${values.length}`
    }

    const { rows } = await this.db.query<TodoRow>(
      `SELECT id, name, created_at, done FROM todos ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      values,
    )

    return rows.map(toTodo)
  }

  async delete(id: string): Promise<void> {
    const { rowCount } = await this.db.query(
      `DELETE FROM todos WHERE id = $1`,
      [id],
    )
    if (!rowCount) {
      throw new ApplicationError(
        `Todo with id ${id} was not found`,
        'NOT_FOUND',
      )
    }
  }

  async finish(id: string): Promise<void> {
    const { rowCount } = await this.db.query(
      `UPDATE todos SET done = true WHERE id = $1`,
      [id],
    )
    if (!rowCount) {
      throw new ApplicationError(
        `Todo with id ${id} was not found`,
        'NOT_FOUND',
      )
    }
  }

  async update(id: string, params: TodoParam): Promise<Todo> {
    const { name } = params
    const { rows } = await this.db.query<TodoRow>(
      `UPDATE todos SET name = $1 WHERE id = $2 RETURNING id, name, created_at, done`,
      [name, id],
    )

    if (!rows[0]) {
      throw new ApplicationError(
        `Todo with id ${id} was not found`,
        'NOT_FOUND',
      )
    }

    return toTodo(rows[0])
  }
}
