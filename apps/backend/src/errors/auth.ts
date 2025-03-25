import {} from "@/types/auth.ts";

export class UserNotFoundError extends Error {
  constructor(message: string | "User not found" = "User not found") {
    super(message);
  }
}

export class PasswordsAreNotMatchError extends Error {
  constructor(
    message: string | "Passwords are not match" = "Passwords are not match"
  ) {
    super(message);
  }
}

export class CreateUserError extends Error {
  constructor(
    message: string | "Error while user creation" = "Error while user creation"
  ) {
    super(message);
  }
}

export class UpdateEmailError extends Error {
  constructor(
    message: string | "Error while email update" = "Error while email update"
  ) {
    super(message);
  }
}

export class UpdatePasswordError extends Error {
  constructor(
    message:
      | string
      | "Error while password update" = "Error while password update"
  ) {
    super(message);
  }
}

export class DeleteUserError extends Error {
  constructor(
    message: string | "Error while user deletion" = "Error while user deletion"
  ) {
    super(message);
  }
}

export class SignInError extends Error {
  constructor(message: string | "Error while sign in" = "Error while sign in") {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string | "Unauthorized" = "Unauthorized") {
    super(message);
  }
}
