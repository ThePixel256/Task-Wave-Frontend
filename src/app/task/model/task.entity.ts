export enum TaskStatus {
  todo = 'todo',
  inProgress = 'in progress',
  done = 'done'
}

export class Task {
  id: number;
  title: string;
  description: string;
  userId: number;
  boardId: number;
  status: TaskStatus;

  constructor(
    {
      id = 0,
      title = '',
      description = '',
      userId = 0,
      boardId = 0,
      status = TaskStatus.todo
    } = {}
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.userId = userId;
    this.boardId = boardId;
    this.status = status;
  }
}
