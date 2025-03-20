import prisma from "@/lib/prisma.ts";
import { jest } from "@jest/globals";

globalThis.jest = jest;

afterAll(async () => {
  await prisma.$disconnect();
});
