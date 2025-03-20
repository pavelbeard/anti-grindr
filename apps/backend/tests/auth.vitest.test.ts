import { expect, test, vi } from "vitest";
import { createUserController } from "../src/controllers/auth.ts";
import prisma from "../src/lib/__mocks__/prisma.ts";

import type { User } from "@prisma/client";

vi.mock("../src/lib/prisma.ts");

test("POST /api/auth/create", async () => {
  const mockUser = {
    id: "1",
    email: "hello@prisma.com",
    password: "hashed_password",
  };
  prisma.user.create.mockResolvedValue(mockUser as User);
  const user = await createUserController(mockUser);

  expect(user.id).toBe("1");
  expect(user.email).toBe(mockUser.email);
});
