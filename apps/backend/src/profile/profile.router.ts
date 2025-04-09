import { validate } from '@/lib/middlewares.ts'
import { Router } from 'express'
import { CreateProfileSchema } from './profile.schemas.ts'

import * as ProfileController from '@/profile/profile.controller.ts'

const profileRouter: Router = Router()

profileRouter.post(
  '/:userId/create',
  validate(CreateProfileSchema),
  ProfileController.createProfile
)

export default profileRouter
