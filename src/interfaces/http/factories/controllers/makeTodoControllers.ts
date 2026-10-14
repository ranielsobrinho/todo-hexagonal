import type { TodoRepository } from '../../../../domain/repositories/ITodoRepository.js'
import type { ApiRoutesOptions } from '../../routes/apiRoutes.js'
import { makeTodoRepository } from '../repositories/makeTodoRepository.js'
import { makeCreateTodoUseCase } from '../usecases/makeCreateTodoUseCase.js'
import { makeDeleteTodoUseCase } from '../usecases/makeDeleteTodoUseCase.js'
import { makeFinishTodoUseCase } from '../usecases/makeFinishTodoUseCase.js'
import { makeGetTodoByIdUseCase } from '../usecases/makeGetTodoByIdUseCase.js'
import { makeListTodosUseCase } from '../usecases/makeListTodosUseCase.js'
import { makeUpdateTodoUseCase } from '../usecases/makeUpdateTodoUseCase.js'
import { makeCreateTodoController } from './makeCreateTodoController.js'
import { makeDeleteTodoController } from './makeDeleteTodoController.js'
import { makeFinishTodoController } from './makeFinishTodoController.js'
import { makeGetTodoByIdController } from './makeGetTodoByIdController.js'
import { makeListTodosController } from './makeListTodosController.js'
import { makeUpdateTodoController } from './makeUpdateTodoController.js'

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
    finishTodoController: makeFinishTodoController(
      makeFinishTodoUseCase(repository),
    ),
    deleteTodoController: makeDeleteTodoController(
      makeDeleteTodoUseCase(repository),
    ),
    updateTodoController: makeUpdateTodoController(
      makeUpdateTodoUseCase(repository),
    ),
  }
}
