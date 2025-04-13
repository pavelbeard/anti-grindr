import { z } from 'zod'
import { CreateProfileSchema, GetProfileSchema, UpdateProfileSchema } from './profile.schemas.ts'

export type CreateProfileSchema = z.infer<typeof CreateProfileSchema>
export type GetProfileSchema = z.infer<typeof GetProfileSchema>
export type UpdateProfileSchema = z.infer<typeof UpdateProfileSchema>
