export interface FinishTodoContract {
  execute(id: string): Promise<void>
}
