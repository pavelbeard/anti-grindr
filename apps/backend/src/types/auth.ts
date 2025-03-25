import {
  createUserSchema,
  signInUserSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "@/schemas/auth.ts";
import { User } from "@prisma/client";
import { z } from "zod";

export interface Session {
  user: {
    id: string;
    email: string;
  } | null;
}

export type CreateUser = z.infer<typeof createUserSchema>;

export interface PublicUser {
  id: string;
  email: string;
  role: User["role"];
  createdAt: User["createdAt"];
  updatedAt: User["updatedAt"];
}

export type UpdateEmail = z.infer<typeof updateEmailSchema>;

export type UpdatePassword = z.infer<typeof updatePasswordSchema>;

export type SignInUser = z.infer<typeof signInUserSchema>;
