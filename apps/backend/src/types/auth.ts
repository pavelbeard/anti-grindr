export interface IUserNotFoundError {
  name: string;
  message: string;
}

export interface IPasswordRequiredError {
  name: string;
  message: string;
}

export interface IHashedPasswordError {
  name: string;
  message: string;
}

export interface CreateUser {
  email: string;
  password: string;
}

export interface UpdateEmail {
  newEmail: string;
  actualPassword: string;
}
