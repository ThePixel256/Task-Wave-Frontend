export class Member {
  id: number;
  userId: number;
  boardId: number;

  constructor({
                id = 0,
                userId = 0,
                boardId = 0
              } = {}) {
    this.id = id;
    this.userId = userId;
    this.boardId = boardId;
  }
}
