import type { TodoRepository } from '../../../domain/repositories/ITodoRepository.js'
import { makeTodoRepository } from '../../http/factories/repositories/makeTodoRepository.js'
import { makeCreateTodoUseCase } from '../../http/factories/usecases/makeCreateTodoUseCase.js'
import { makeGetTodoByIdUseCase } from '../../http/factories/usecases/makeGetTodoByIdUseCase.js'
import { makeListTodosUseCase } from '../../http/factories/usecases/makeListTodosUseCase.js'
import { makeUpdateTodoUseCase } from '../../http/factories/usecases/makeUpdateTodoUseCase.js'
import { makeDeleteTodoUseCase } from '../../http/factories/usecases/makeDeleteTodoUseCase.js'
import { CreateTodoHandler } from '../controllers/CreateTodoHandler.js'
import { GetTodoByIdHandler } from '../controllers/GetTodoByIdHandler.js'
import { ListTodosHandler } from '../controllers/ListTodosHandler.js'
import { UpdateTodoHandler } from '../controllers/UpdateTodoHandler.js'
import { DeleteTodoHandler } from '../controllers/DeleteTodoHandler.js'
import type { TodoServiceDependencies } from '../routes/todoService.js'
import { FinishTodoHandler } from '../controllers/FinishTodoHandler.js'
import { makeFinishTodoUseCase } from '../../http/factories/usecases/makeFinishTodoUseCase.js'
import { CreateTodosStreamHandler } from '../controllers/CreateTodosStreamHandler.js'

export function makeTodoHandlers(
  repository: TodoRepository = makeTodoRepository(),
): TodoServiceDependencies {
  return {
    createTodoHandler: new CreateTodoHandler(makeCreateTodoUseCase(repository)),
    getTodoByIdHandler: new GetTodoByIdHandler(
      makeGetTodoByIdUseCase(repository),
    ),
    listTodosHandler: new ListTodosHandler(makeListTodosUseCase(repository)),
    updateTodoHandler: new UpdateTodoHandler(makeUpdateTodoUseCase(repository)),
    deleteTodoHandler: new DeleteTodoHandler(makeDeleteTodoUseCase(repository)),
    finishTodoHandler: new FinishTodoHandler(makeFinishTodoUseCase(repository)),
    createTodosStreamHandler: new CreateTodosStreamHandler(
      makeCreateTodoUseCase(repository),
    ),
  }
}
