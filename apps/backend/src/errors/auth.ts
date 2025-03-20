import {
  IHashedPasswordError,
  IPasswordRequiredError,
  IUserNotFoundError,
} from "@/types/auth.ts";

export class UserNotFoundError implements Error, IUserNotFoundError {
  name: string;
  message: string;

  constructor(
    name: string = "UserNotFoundError",
    message: string | "User not found" = "User not found"
  ) {
    this.name = name;
    this.message = message;
  }
}

export class PasswordRequiredError implements Error, IPasswordRequiredError {
  name: string;
  message: string;

  constructor(
    name: string = "PasswordRequiredError",
    message: string | "Password is required" = "Password is required"
  ) {
    this.name = name;
    this.message = message;
  }
}

export class PasswordsAreNotMatchError implements Error, IHashedPasswordError {
  name: string;
  message: string;

  constructor(
    name: string = "PasswordsAreNotMatchError",
    message: string | "Passwords are not match" = "Passwords are not match"
  ) {
    this.name = name;
    this.message = message;
  }
}
