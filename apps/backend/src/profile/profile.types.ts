import { z } from 'zod'
import { CreateProfileSchema, GetProfileSchema } from './profile.schemas.ts'

export type CreateProfileSchema = z.infer<typeof CreateProfileSchema>['params']
export type GetProfileSchema = z.infer<typeof GetProfileSchema>['params']
