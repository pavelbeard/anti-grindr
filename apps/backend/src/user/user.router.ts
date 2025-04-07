import { authorization, validate } from '@/lib/middlewares.ts'
import * as AuthController from '@/user/user.controller.ts'
import {
  CreateUserSchema,
  DeleteAccountSchema,
  RefreshTokenSchema,
  SignInUserSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema
} from '@/user/user.schemas.ts'
import { Router } from 'express'
import { AnyZodObject } from 'zod'

const authRouter: Router = Router()

authRouter.post('/sign-up', validate(CreateUserSchema), AuthController.signUp)
authRouter.post('/sign-in', validate(SignInUserSchema), AuthController.signIn)
authRouter.post('/sign-out', authorization, AuthController.signOut)
authRouter.post(
  '/refresh-token',
  validate(RefreshTokenSchema),
  AuthController.refreshToken
)

authRouter.get('/:id', authorization, AuthController.getUser)

authRouter.patch(
  '/:id/update-email',
  authorization,
  validate(UpdateEmailSchema),
  AuthController.updateEmail
)
authRouter.patch(
  '/:id/update-password',
  authorization,
  validate(UpdatePasswordSchema as unknown as AnyZodObject),
  AuthController.updatePassword
)

authRouter.delete(
  '/:id',
  authorization,
  validate(DeleteAccountSchema),
  AuthController.deleteAccount
)

export default authRouter
