export class Todo {
  constructor(
    public readonly id: string,
    public name: string,
    public createdAt: Date,
    public done: boolean,
  ) {}

  static create(data: Partial<Todo>): Todo {
    if (!data.id) {
      throw new Error('Todo must have an id')
    }

    if (!data.name) {
      throw new Error('Todo must have a name')
    }

    return new Todo(
      data.id,
      data.name,
      (data.createdAt = new Date()),
      data.done ? data.done : false,
    )
  }
}
