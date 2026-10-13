import type { FastifyInstance } from 'fastify'
import type { TodoRepository } from '../../src/domain/repositories/ITodoRepository.js'
import { CreateTodoController } from '../../src/interfaces/controllers/CreateTodoController.js'
import { GetTodoByIdController } from '../../src/interfaces/controllers/GetTodoByIdController.js'
import { ListTodosController } from '../../src/interfaces/controllers/ListTodosController.js'
import { buildServer } from '../../src/interfaces/http/server.js'
import { CreateTodoUseCase } from '../../src/usecases/todo/CreateTodoUseCase.js'
import { GetTodoByIdUseCase } from '../../src/usecases/todo/GetTodoByIdUseCase.js'
import { ListTodosUseCase } from '../../src/usecases/todo/ListTodosUseCase.js'

export function buildTestApp(repository: TodoRepository): FastifyInstance {
  return buildServer({
    createTodoController: new CreateTodoController(
      new CreateTodoUseCase(repository),
    ),
    getTodoByIdController: new GetTodoByIdController(
      new GetTodoByIdUseCase(repository),
    ),
    listTodosController: new ListTodosController(
      new ListTodosUseCase(repository),
    ),
  })
}
