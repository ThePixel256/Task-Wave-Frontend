export class Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userId: number;

  constructor(
    {
      id = 0,
      firstName = '',
      lastName = '',
      email = '',
      userId = 0
    } = {}
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.userId = userId;
  }
}
