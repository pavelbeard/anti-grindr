import type { User } from "@prisma/client";
import { MockContext, Context, createMockContext } from "../context.ts";
import { registerUser } from "./auth.context.ts";

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

test("Should create new user", async () => {
  const user = {
    id: "Xc109",
    name: "John Doe",
    email: "hello@prisma.com",
    password: "hashed_password",
    role: "user" as User["role"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockCtx.prisma.user.create.mockResolvedValue(user);

  const result = registerUser(user, ctx);

  console.log(await result);

  await expect(result).resolves.toEqual({
    id: "Xc109",
    name: "John Doe",
    email: "hello@prisma.com",
    password: "hashed_password",
    role: "user",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
