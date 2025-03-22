import bcrypt from "@node-rs/bcrypt";
import { expect, test, vi } from "vitest";
import {
  createUser,
  getUser,
  updateEmail,
  updatePassword,
} from "../src/controllers/auth.ts";
import prisma from "../src/lib/__mocks__/prisma.ts";

import type { User } from "@prisma/client";

vi.mock("../src/lib/prisma.ts");

test("Create user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: "hashed_password",
  };
  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await createUser(mockUser);

  expect(user.id).toBe("1");
  expect(user.email).toBe(mockUser.email);
});

test("Create and get user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: "hashed_password",
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await createUser(mockUser);

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  const user2 = await getUser({ id: user.id });

  expect(user2?.id).toBe(user.id);
  expect(user2?.email).toBe(user.email);
});

test("Create and change email of the user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: bcrypt.hashSync("hashed_password", 10),
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await createUser(mockUser);

  const mockNewEmail = "new_email@prisma.com";
  const mockPassword = "hashed_password";

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  prisma.user.update.mockResolvedValue({
    ...mockUser,
    email: mockNewEmail,
  } as User);

  const user2 = await updateEmail({
    id: user.id,
    data: { newEmail: mockNewEmail, actualPassword: mockPassword },
  });

  expect(user2?.id).toBe(user.id);
  expect(user2?.email).toBe(mockNewEmail);
});

test("Create and change password of the user", async () => {
  const mockUser = {
    id: "1",
    email: "prisma@hello.com",
    password: bcrypt.hashSync("hashed_password", 10),
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await createUser(mockUser);

  const mockNewPassword = bcrypt.hashSync("mockNewPassword", 10);

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  prisma.user.update.mockResolvedValue({
    ...mockUser,
    password: mockNewPassword,
  } as User);

  const user2 = await updatePassword({
    id: user.id,
    data: { newPassword: mockNewPassword, actualPassword: "hashed_password" },
  });

  expect(user2?.id).toBe(user.id);
  expect(user2?.password).toBe(mockNewPassword);
});
