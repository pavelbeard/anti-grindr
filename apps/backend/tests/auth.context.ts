import { Context } from "../context.ts";

interface RegisterUser {
  id: string;
  email: string;
  password: string;
}

export async function registerUser(user: RegisterUser, ctx: Context) {
  return await ctx.prisma.user.create({
    data: user,
  });
}

interface UpdateEmail {
  id: string;
  newEmail: string;
}

export async function updateEmail(newUser: UpdateEmail, ctx: Context) {
  return await ctx.prisma.user.update({
    where: { id: newUser.id },
    data: { email: newUser.newEmail },
  });
}
