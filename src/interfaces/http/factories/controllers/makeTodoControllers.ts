import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import type { ApiRoutesOptions } from '../../routes/apiRoutes.js'
import { makeTodoRepository } from '../repositories/makeTodoRepository.js'
import { makeCreateTodoUseCase } from '../usecases/makeCreateTodoUseCase.js'
import { makeGetTodoByIdUseCase } from '../usecases/makeGetTodoByIdUseCase.js'
import { makeListTodosUseCase } from '../usecases/makeListTodosUseCase.js'
import { makeCreateTodoController } from './makeCreateTodoController.js'
import { makeGetTodoByIdController } from './makeGetTodoByIdController.js'
import { makeListTodosController } from './makeListTodosController.js'

export function makeTodoControllers(
  repository: TodoRepository = makeTodoRepository(),
): ApiRoutesOptions {
  return {
    createTodoController: makeCreateTodoController(
      makeCreateTodoUseCase(repository),
    ),
    getTodoByIdController: makeGetTodoByIdController(
      makeGetTodoByIdUseCase(repository),
    ),
    listTodosController: makeListTodosController(
      makeListTodosUseCase(repository),
    ),
  }
}
