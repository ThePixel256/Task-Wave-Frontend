export class Board {
  id: number;
  title: string;
  description: string;
  ownerId: number;

  constructor({
                id = 0,
                title = '',
                description = '',
                ownerId = 0
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.ownerId = ownerId;
  }
}
