import type { CreateTodoContract } from '../../../../domain/contracts/todo/CreateTodoContract.js'
import { CreateTodoController } from '../../../controllers/CreateTodoController.js'

export function makeCreateTodoController(
  createTodoUseCase: CreateTodoContract,
): CreateTodoController {
  return new CreateTodoController(createTodoUseCase)
}
