import type { FinishTodoContract } from '../../../../domain/contracts/todo/FinishTodoContract.js'
import { FinishTodoController } from '../../../controllers/FinishTodoController.js'

export function makeFinishTodoController(
  finishTodoUseCase: FinishTodoContract,
): FinishTodoController {
  return new FinishTodoController(finishTodoUseCase)
}
