import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import { pool } from '../../../../infrastructure/database/pool.js'
import { PgTodoRepository } from '../../../../infrastructure/repositories/TodoRepository.js'

export function makeTodoRepository(): TodoRepository {
  return new PgTodoRepository(pool)
}
