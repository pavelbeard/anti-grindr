import { AppError } from '@/lib/utility-classes.ts'
import { JWT_HTTP_SECURED } from '@/settings.ts'
import * as AuthService from '@/user/user.service.ts'
import {
  CreateUserSchema,
  RefreshTokenSchema,
  SignInUserSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema
} from '@/user/user.types.ts'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

// TODO: implement Oauth2 flow

export const signUp: RequestHandler = async (
  req: Request<unknown, unknown, CreateUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const userData = {
    email: req.body.email,
    password: req.body.password
  }

  if ((await AuthService.findUserByEmail(userData.email)) != null) {
    return next(new AppError('validation', 'User already exists.'))
  }

  const user = await AuthService.createUser(userData)

  res.status(201).json({ message: 'User created successfully.', user })
}

export const signIn: RequestHandler = async (
  req: Request<unknown, unknown, SignInUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body

  const existingUser = await AuthService.findUserByEmail(email)

  if (existingUser == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  if (!AuthService.comparePassword(password, existingUser.password)) {
    return next(new AppError('validation', 'Password is wrong.'))
  }

  const publicUser = AuthService.omitSecretFields(existingUser)

  const token = AuthService.createJWT(publicUser)
  const refreshToken = await AuthService.createRefreshToken(publicUser.id)

  res
    .status(200)
    .cookie('__rclientid', refreshToken, {
      httpOnly: true,
      secure: JWT_HTTP_SECURED,
      sameSite: 'strict'
    })
    .json({ user: publicUser, token })
}

export const signOut: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.__rclientid

  if (!refreshToken) {
    return next(new AppError('validation', 'Refresh token not found.'))
  }

  const existingUser = await AuthService.findByRefreshToken(refreshToken)

  if (existingUser == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  await AuthService.deleteRefreshToken(existingUser, refreshToken)

  res
    .status(200)
    .clearCookie('__rclientid')
    .json({ message: 'User signed out successfully.' })
}

export const refreshToken: RequestHandler = async (
  req: Request<unknown, unknown, RefreshTokenSchema>,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.__rclientid

  if (!refreshToken) {
    return next(new AppError('validation', 'Refresh token not found.'))
  }

  const existingUser = await AuthService.findByRefreshToken(refreshToken)

  if (existingUser == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  const publicUser = AuthService.omitSecretFields(existingUser)

  const token = AuthService.createJWT(publicUser)
  const newRefreshToken = await AuthService.createRefreshToken(publicUser.id)

  res
    .status(200)
    .cookie('__rclientid', newRefreshToken, {
      httpOnly: true,
      secure: JWT_HTTP_SECURED,
      sameSite: 'strict'
    })
    .json({ token })
}

export const getUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await AuthService.findUserById(req.params.id)

  if (user == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  const publicUser = AuthService.omitSecretFields(user)

  res.status(200).json({ user: publicUser })
}

export const updateEmail: RequestHandler<UpdateEmailSchema['params']> = async (
  req: Request<UpdateEmailSchema['params'], unknown, UpdateEmailSchema['body']>,
  res: Response,
  next: NextFunction
) => {
  const userData = {
    id: req.params.id,
    newEmail: req.body.newEmail,
    actualPassword: req.body.actualPassword
  }

  const existingUser = await AuthService.findUserById(userData.id)

  if (existingUser == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  if (
    !AuthService.comparePassword(userData.actualPassword, existingUser.password)
  ) {
    return next(new AppError('validation', 'Actual password is wrong.'))
  }

  const updatedUser = AuthService.omitSecretFields(
    await AuthService.updateUserEmail(userData.id, userData.newEmail)
  )

  res
    .status(200)
    .json({ message: 'User email updated successfully.', user: updatedUser })
}

export const updatePassword: RequestHandler<
  UpdatePasswordSchema['params']
> = async (
  req: Request<
    UpdatePasswordSchema['params'],
    unknown,
    UpdatePasswordSchema['body']
  >,
  res: Response,
  next: NextFunction
) => {
  const userData = {
    id: req.params.id,
    newPassword: req.body.newPassword,
    actualPassword: req.body.actualPassword,
    repeatNewPassword: req.body.repeatNewPassword
  }

  const existingUser = await AuthService.findUserById(userData.id)

  if (existingUser == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  const userPassword = AuthService.comparePassword(
    userData.actualPassword,
    existingUser.password
  )

  if (!userPassword) {
    return next(new AppError('validation', 'Actual password is wrong.'))
  }

  if (userData.newPassword !== userData.repeatNewPassword) {
    return next(new AppError('validation', "Passwords don't match."))
  }

  const updatedUser = AuthService.omitSecretFields(
    await AuthService.updateUserPassword(userData.id, userData.newPassword)
  )

  res.status(200).json({
    message: 'User password updated successfully.',
    user: updatedUser
  })
}

export const deleteAccount: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userData = {
    id: req.params.id,
    actualPassword: req.body.actualPassword
  }

  const refreshToken = req.cookies.__rclientid

  if (!refreshToken) {
    return next(new AppError('validation', 'Refresh token not found.'))
  }

  const existingUser = await AuthService.findUserById(userData.id)

  if (existingUser == null) {
    return next(new AppError('notFound', 'User not found.'))
  }

  const userPassword = AuthService.comparePassword(
    userData.actualPassword,
    existingUser.password
  )

  if (!userPassword) {
    return next(new AppError('validation', 'Actual password is wrong.'))
  }

  await AuthService.deleteUser(userData.id)

  res.status(204).clearCookie('__rclientid').json({})
}
