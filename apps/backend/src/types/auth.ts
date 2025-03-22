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
  actualPassword: string;
  newEmail: string;
}

export interface UpdatePassword {
  actualPassword: string;
  newPassword: string;
}
