import {
  PasswordRequiredError,
  PasswordsAreNotMatchError,
  UserNotFoundError,
} from "@/errors/auth.ts";
import prisma from "@/lib/prisma.ts";
import type { CreateUser, UpdateEmail } from "@/types/auth.ts";
import bcrypt from "@node-rs/bcrypt";
import type { User } from "@prisma/client";
// implement Oauth2 flow

export const createUserController = async (data: CreateUser) => {
  const { email, password } = data;
  const hashedPassword = bcrypt.hashSync(password, 10);
  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
};

export const getUserController = async ({ id }: { id: string }) => {
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

export const updateEmailController = async ({
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
    where: {
      id,
    },
    select: {
      password: true,
    },
  });

  if (!userPassword) {
    throw new UserNotFoundError();
  }

  if (!bcrypt.compareSync(actualPassword, userPassword.password)) {
    throw new PasswordsAreNotMatchError();
  }

  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      email: newEmail,
    },
  });
};
