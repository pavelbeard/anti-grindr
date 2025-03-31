import prisma from "@/lib/__mocks__/prisma.ts";
import { expect, test, vi } from "vitest";
import * as AuthService from "./user.service.ts";

vi.mock("../lib/prisma.ts");

test("Create user", async () => {
  const userData = {
    email: "test@example.com",
    password: "Err0r!@1",
  };

  prisma.user.create.mockResolvedValue({
    id: "1",
    role: "user",
    isActive: true,
    refreshToken: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...userData,
  });
  const user = await AuthService.createUser(userData);

  expect(user).toBeDefined();
  expect(user.email).toBe(userData.email);
  expect(user.password).toBeDefined();

  // Consider that the mock result that's what I expected.

  /*
  expect(user).toStrictEqual({
    ...userData,
    id: "1",
    role: "user",
    isActive: true,
    refreshToken: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  */

});
