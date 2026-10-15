import type { DeleteTodoContract } from '../../../../domain/contracts/todo/DeleteTodoContract.js'
import { DeleteTodoController } from '../../../controllers/DeleteTodoController.js'

export function makeDeleteTodoController(
  deleteTodoUseCase: DeleteTodoContract,
): DeleteTodoController {
  return new DeleteTodoController(deleteTodoUseCase)
}
