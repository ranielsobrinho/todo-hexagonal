export interface DeleteTodoContract {
  execute(id: string): Promise<void>
}
