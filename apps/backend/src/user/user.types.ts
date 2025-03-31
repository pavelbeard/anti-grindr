import { User } from "@prisma/client";
import { z } from "zod";
import {
  CreateUserSchema,
  DeleteAccountSchema,
  RefreshTokenSchema,
  SignInUserSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema,
} from "./user.schemas.ts";

export interface Session {
  user: {
    id: string;
    email: string;
  } | null;
}

export type CreateUserSchema = z.infer<typeof CreateUserSchema>;

export interface PublicUser {
  id: string;
  email: string;
  role: User["role"];
  createdAt: User["createdAt"];
  updatedAt: User["updatedAt"];
}

export type UpdateEmailSchema = z.infer<typeof UpdateEmailSchema>;
export type UpdatePasswordSchema = z.infer<typeof UpdatePasswordSchema>;
export type SignInUserSchema = z.infer<typeof SignInUserSchema>;
export type DeleteAccountSchema = z.infer<typeof DeleteAccountSchema>;
export type RefreshTokenSchema = z.infer<typeof RefreshTokenSchema>;
