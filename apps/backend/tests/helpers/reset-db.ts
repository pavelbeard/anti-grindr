import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.album.deleteMany(),
    prisma.gender.deleteMany(),
    prisma.picture.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.pronoun.deleteMany(),
  ]);
};