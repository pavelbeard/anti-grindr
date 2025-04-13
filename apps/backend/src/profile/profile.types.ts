import { z } from 'zod'
import { CreateProfileSchema, GetProfileSchema } from './profile.schemas.ts'

export type CreateProfileSchema = z.infer<typeof CreateProfileSchema>
export type GetProfileSchema = z.infer<typeof GetProfileSchema>
