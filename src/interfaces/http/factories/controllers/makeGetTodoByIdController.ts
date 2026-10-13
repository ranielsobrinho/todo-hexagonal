import type { GetTodoByIdContract } from '../../../../domain/contracts/todo/GetTodoByIdContract.js'
import { GetTodoByIdController } from '../../../controllers/GetTodoByIdController.js'

export function makeGetTodoByIdController(
  getTodoByIdUseCase: GetTodoByIdContract,
): GetTodoByIdController {
  return new GetTodoByIdController(getTodoByIdUseCase)
}
