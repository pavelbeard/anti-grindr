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

export type PublicUser = Omit<User, 'password' | 'refreshToken' | 'role'>

export type CreateUserSchema = z.infer<typeof CreateUserSchema>['body']
export type SignInUserSchema = z.infer<typeof SignInUserSchema>['body']

export type RefreshTokenSchema = z.infer<typeof RefreshTokenSchema>['body']
export type UpdateEmailSchema = z.infer<typeof UpdateEmailSchema>
export type UpdatePasswordSchema = z.infer<typeof UpdatePasswordSchema>

export type DeleteAccountSchema = z.infer<typeof DeleteAccountSchema>['body']
