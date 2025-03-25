import bcrypt from "@node-rs/bcrypt";
import { expect, test, vi } from "vitest";
import { AuthController } from "../src/controllers/auth.ts";
import prisma from "../src/lib/__mocks__/prisma.ts";

import type { User } from "@prisma/client";

vi.mock("../src/lib/prisma.ts");

test("Create user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: "err!RorW1",
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await AuthController.createUser({
    email: mockUser.email,
    password: mockUser.password,
  });

  expect(user.id).toBe("1");
  expect(user.email).toBe(mockUser.email);
});

test("Create and get user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: "err!RorW1",
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await AuthController.createUser(mockUser);

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  const user2 = await AuthController.getUser({ id: user.id });

  expect(user2?.id).toBe(user.id);
  expect(user2?.email).toBe(user.email);
  expect(user2?.password).not.toBeDefined();
});

test("Create and change email of the user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: bcrypt.hashSync("err!RorW1", 10),
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await AuthController.createUser(mockUser);

  const mockNewEmail = "new_email@prisma.com";
  const mockPassword = "err!RorW1";

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  prisma.user.update.mockResolvedValue({
    ...mockUser,
    email: mockNewEmail,
  } as User);

  const user2 = await AuthController.updateEmail({
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
    password: bcrypt.hashSync("err!RorW1", 10),
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await AuthController.createUser(mockUser);

  const mockNewPassword = bcrypt.hashSync("err!RorA90", 10);

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  prisma.user.update.mockResolvedValue({
    ...mockUser,
    password: mockNewPassword,
  } as User);

  const user2 = await AuthController.updatePassword({
    id: user.id,
    data: {
      actualPassword: "err!RorW1",
      newPassword: mockNewPassword,
      repeatNewPassword: mockNewPassword,
    },
  });

  expect(user2?.id).toBe(user.id);
  expect(user2?.password).not.toBeDefined();
});

test("Create and sign in the user", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: bcrypt.hashSync("err!RorW1", 10),
  };

  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await AuthController.createUser(mockUser);

  const mockPassword = "err!RorW1";

  prisma.user.findUnique.mockResolvedValue(mockUser as User);
  const user2 = await AuthController.signIn({
    email: mockUser.email,
    password: mockPassword,
  });

  expect(user2?.id).toBe(user.id);
  expect(user2.token).toBeDefined();
  expect(user2?.password).not.toBeDefined();
});
