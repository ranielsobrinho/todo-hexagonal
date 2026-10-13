import { pool } from './infrastructure/database/pool.js'
import { PgTodoRepository } from './infrastructure/repositories/TodoRepository.js'
import { CreateTodoController } from './interfaces/controllers/CreateTodoController.js'
import { GetTodoByIdController } from './interfaces/controllers/GetTodoByIdController.js'
import { ListTodosController } from './interfaces/controllers/ListTodosController.js'
import { buildServer } from './interfaces/http/server.js'
import { CreateTodoUseCase } from './usecases/todo/CreateTodoUseCase.js'
import { GetTodoByIdUseCase } from './usecases/todo/GetTodoByIdUseCase.js'
import { ListTodosUseCase } from './usecases/todo/ListTodosUseCase.js'

const todoRepository = new PgTodoRepository(pool)
const createTodoUseCase = new CreateTodoUseCase(todoRepository)
const getTodoByIdUseCase = new GetTodoByIdUseCase(todoRepository)
const listTodosUseCase = new ListTodosUseCase(todoRepository)
const createTodoController = new CreateTodoController(createTodoUseCase)
const getTodoByIdController = new GetTodoByIdController(getTodoByIdUseCase)
const listTodosController = new ListTodosController(listTodosUseCase)

const app = buildServer({
  createTodoController,
  getTodoByIdController,
  listTodosController,
})

const port = Number(process.env.PORT) || 3000

try {
  await app.listen({ port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

const shutdown = async (signal: string): Promise<void> => {
  app.log.info(`received ${signal}, shutting down`)
  await app.close()
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
