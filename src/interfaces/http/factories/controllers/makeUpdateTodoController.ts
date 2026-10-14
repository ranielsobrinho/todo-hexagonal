import type { UpdateTodoContract } from '../../../../domain/contracts/todo/UpdateTodoContract.js'
import { UpdateTodoController } from '../../../controllers/UpdateTodoController.js'

export function makeUpdateTodoController(
  updateTodoUseCase: UpdateTodoContract,
): UpdateTodoController {
  return new UpdateTodoController(updateTodoUseCase)
}
