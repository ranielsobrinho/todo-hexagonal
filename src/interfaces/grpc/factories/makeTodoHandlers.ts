import type { TodoRepository } from '../../../domain/repositories/ITodoRepository.js'
import { makeTodoRepository } from '../../http/factories/repositories/makeTodoRepository.js'
import { makeCreateTodoUseCase } from '../../http/factories/usecases/makeCreateTodoUseCase.js'
import { makeGetTodoByIdUseCase } from '../../http/factories/usecases/makeGetTodoByIdUseCase.js'
import { makeListTodosUseCase } from '../../http/factories/usecases/makeListTodosUseCase.js'
import { CreateTodoHandler } from '../controllers/CreateTodoHandler.js'
import { GetTodoByIdHandler } from '../controllers/GetTodoByIdHandler.js'
import { ListTodosHandler } from '../controllers/ListTodosHandler.js'
import type { TodoServiceDependencies } from '../routes/todoService.js'

export function makeTodoHandlers(
  repository: TodoRepository = makeTodoRepository(),
): TodoServiceDependencies {
  return {
    createTodoHandler: new CreateTodoHandler(makeCreateTodoUseCase(repository)),
    getTodoByIdHandler: new GetTodoByIdHandler(
      makeGetTodoByIdUseCase(repository),
    ),
    listTodosHandler: new ListTodosHandler(makeListTodosUseCase(repository)),
  }
}
