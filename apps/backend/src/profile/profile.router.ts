import { validate } from '@/lib/middlewares.ts'
import {
  CreateProfileSchema,
  GetProfileSchema,
  UpdateProfileSchema,
} from '@/profile/profile.schemas.ts'
import { Router } from 'express'

import * as ProfileController from '@/profile/profile.controller.ts'

const profileRouter: Router = Router()

profileRouter.post(
  '/:userId/create',
  validate(CreateProfileSchema),
  ProfileController.createProfile,
)
profileRouter.get(
  '/:userId',
  validate(GetProfileSchema),
  ProfileController.getProfile,
)
profileRouter.patch(
  '/:userId',
  validate(UpdateProfileSchema),
  ProfileController.updateProfile,
)

export default profileRouter
