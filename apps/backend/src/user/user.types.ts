import { User } from '@prisma/client'
import { z } from 'zod'
import {
  CreateUserSchema,
  DeleteAccountSchema,
  RefreshTokenSchema,
  SignInUserSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema
} from './user.schemas.ts'

export interface Session {
  userId: string | null
}

export type CreateUserSchema = z.infer<typeof CreateUserSchema>

export type PublicUser = Omit<User, 'password' | 'refreshToken' | 'role'>

export type UpdateEmailSchema = z.infer<typeof UpdateEmailSchema>
export type UpdatePasswordSchema = z.infer<typeof UpdatePasswordSchema>
export type SignInUserSchema = z.infer<typeof SignInUserSchema>
export type DeleteAccountSchema = z.infer<typeof DeleteAccountSchema>
export type RefreshTokenSchema = z.infer<typeof RefreshTokenSchema>
