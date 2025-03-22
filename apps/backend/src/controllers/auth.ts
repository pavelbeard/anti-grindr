import {
  PasswordRequiredError,
  PasswordsAreNotMatchError,
  UserNotFoundError,
} from "@/errors/auth.ts";
import prisma from "@/lib/prisma.ts";
import type { CreateUser, UpdateEmail, UpdatePassword } from "@/types/auth.ts";
import bcrypt from "@node-rs/bcrypt";
import type { User } from "@prisma/client";
// implement Oauth2 flow

export const createUser = async (data: CreateUser) => {
  const { email, password } = data;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  if (!user) {
    throw new Error("User not created.");
  }

  return user;
};

export const getUser = async ({ id }: { id: string }) => {
  const user: User | null = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
};

export const updateEmail = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateEmail;
}) => {
  const { newEmail, actualPassword } = data;

  if (!actualPassword) {
    throw new PasswordRequiredError();
  }

  const userPassword = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

  if (!userPassword) {
    throw new UserNotFoundError();
  }

  if (!bcrypt.compareSync(actualPassword, userPassword.password)) {
    throw new PasswordsAreNotMatchError();
  }

  return await prisma.user.update({
    where: { id },
    data: { email: newEmail },
  });
};

export const updatePassword = async ({
  id,
  data,
}: {
  id: string;
  data: UpdatePassword;
}) => {
  const { newPassword, actualPassword } = data;

  if (!actualPassword) {
    throw new PasswordRequiredError();
  }

  const userPassword = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

  if (!userPassword) {
    throw new UserNotFoundError();
  }

  if (!bcrypt.compareSync(actualPassword, userPassword.password)) {
    throw new PasswordsAreNotMatchError();
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  return await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
};
