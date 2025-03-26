import {
  CreateUserError,
  PasswordsAreNotMatchError,
  SignInError,
  UpdateEmailError,
  UpdatePasswordError,
  UserNotFoundError,
} from "@/errors/user.ts";
import prisma from "@/lib/prisma.ts";
import {
  createUserSchema,
  signInUserSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "@/schemas/user.ts";
import type {
  CreateUser,
  SignInUser,
  UpdateEmail,
  UpdatePassword,
} from "@/types/user.ts";
import bcrypt from "@node-rs/bcrypt";

// TODO: implement Oauth2 flow

class AuthController {
  static async createUser(data: CreateUser) {
    const validatedObject = createUserSchema.safeParse(data);

    if (!validatedObject.success) {
      throw new CreateUserError(validatedObject.error.message);
    }

    const { email, password } = validatedObject.data;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    if (!user) {
      throw new CreateUserError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...publicUser } = user;

    return publicUser;
  }

  static async getUser({ id }: { id: string }) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...publicUser } = user;

    return publicUser;
  }

  static async updateEmail({ id, data }: { id: string; data: UpdateEmail }) {
    const validatedObject = updateEmailSchema.safeParse(data);

    if (!validatedObject.success) {
      throw new UpdateEmailError(validatedObject.error.message);
    }

    const { newEmail, actualPassword } = validatedObject.data;

    const userPassword = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!userPassword) {
      throw new UserNotFoundError();
    }

    if (!bcrypt.compareSync(actualPassword, userPassword.password)) {
      throw new PasswordsAreNotMatchError("Actual password is wrong.");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { email: newEmail },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...publicUser } = user;

    return publicUser;
  }

  static async updatePassword({
    id,
    data,
  }: {
    id: string;
    data: UpdatePassword;
  }) {
    const validatedObject = updatePasswordSchema.safeParse(data);

    if (!validatedObject.success) {
      throw new UpdatePasswordError(validatedObject.error.message);
    }

    const { newPassword, actualPassword } = validatedObject.data;

    const userPassword = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!userPassword) {
      throw new UserNotFoundError();
    }

    if (!bcrypt.compareSync(actualPassword, userPassword.password)) {
      throw new PasswordsAreNotMatchError("Actual password is wrong.");
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...publicUser } = user;

    return publicUser;
  }

  static async deleteUser() {
    throw new Error("Not implemented yet");
  }

  static async signIn(data: SignInUser) {
    const validatedObject = signInUserSchema.safeParse(data);

    if (!validatedObject.success) {
      throw new SignInError(validatedObject.error.message);
    }

    const { email, password } = validatedObject.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UserNotFoundError("Email is wrong or not found.");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new PasswordsAreNotMatchError("Password is wrong.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...publicUser } = user;

    return publicUser;
  }
}

export { AuthController };
