import prisma from "@/lib/prisma.ts";
import {
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_TOKEN_EXPIRATION_TIME,
  NODE_JWT_REFRESH_SECRET_KEY,
  NODE_JWT_SECRET_KEY,
} from "@/settings.ts";
import { CreateUserSchema } from "@/user/user.types.ts";
import bcrypt from "@node-rs/bcrypt";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export const createUser = async (user: CreateUserSchema) => {
  user.password = bcrypt.hashSync(user.password, 10);

  return await prisma.user.create({
    data: user,
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findByRefreshToken = async (refreshToken: string) => {
  return await prisma.user.findFirst({
    where: {
      refreshToken: {
        has: refreshToken,
      },
    },
  });
};

export const updateUser = async (id: string, data: User) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const comparePassword = (input: string, encrypted: string) => {
  return bcrypt.compareSync(input, encrypted);
};

export const createToken = (payload: Omit<User, "password">) => {
  return jwt.sign(payload, NODE_JWT_SECRET_KEY as string, {
    expiresIn: JWT_TOKEN_EXPIRATION_TIME,
  });
};

export const createRefreshToken = (userId: User["id"]) => {
  return jwt.sign({ id: userId }, NODE_JWT_REFRESH_SECRET_KEY as string, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  });
};

export const deleteRefreshToken = async (existingUser: User, refreshToken: string) => {
  return await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      refreshToken: {
        set: existingUser?.refreshToken?.filter(
          (token) => token !== refreshToken
        ),
      },
    },
  });
};

export const omitSecretFields = (
  user: User
): Omit<User, "password" | "refreshToken"> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, refreshToken, ...publicUser } = user;
  return publicUser;
};
