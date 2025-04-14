import { AppError } from '@/lib/utility-classes.ts'
import * as ProfileService from '@/profile/profile.service.ts'
import {
  CreateProfileSchema,
  GetProfileSchema,
  UpdateProfileSchema,
} from '@/profile/profile.types.ts'
import * as UserService from '@/user/user.service.ts'
import { Profile } from '@prisma/client'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

// TODO: Implement gender, pronoun, picture, album logic

export const createProfile = async (
  req: Request<CreateProfileSchema['params'], unknown, unknown>,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params

  if (!await UserService.findUserById(userId)) {
    return next(new AppError('validation', 'User not found'))
  }

  if (await ProfileService.findProfileByUserId(userId)) {
    return next(new AppError('validation', 'Profile already exists'))
  }

  const profile = await ProfileService.createProfile(userId)

  res.status(201).json(profile)
}

export const getProfile: RequestHandler<GetProfileSchema['params']> = async (
  req: Request<GetProfileSchema['params'], unknown, GetProfileSchema['body']>,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params
  const { onlyNameAndPicture } = req.body ?? { onlyNameAndPicture: false }

  const profile = onlyNameAndPicture
    ? await ProfileService.findProfileNameAndMainPicture(userId)
    : await ProfileService.findProfileByUserId(userId)

  if (!profile) {
    return next(new AppError('notFound', 'Profile not found'))
  }

  res.status(200).json(profile)
}

export const updateProfile: RequestHandler<
  UpdateProfileSchema['params']
> = async (
  req: Request<
    UpdateProfileSchema['params'],
    unknown,
    UpdateProfileSchema['body']
  >,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params
  const { name, age, bio, sexRole, genders } = req.body

  const existingProfile = await ProfileService.findProfileByUserId(userId)

  if (!existingProfile) {
    return next(new AppError('notFound', 'Profile not found'))
  }

  const updatedProfile = await ProfileService.updateProfile(userId, {
    name,
    age,
    bio,
    sexRole,
    genders,
  } as unknown as Profile)

  res.status(200).json(updatedProfile)
}
