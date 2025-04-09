import prisma from '@/lib/prisma.ts'
import type { Profile } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import * as ProfileService from '@/profile/profile.service.ts'
import { AppError } from '@/lib/utility-classes.ts'
import { CreateProfileSchema, GetProfileSchema } from './profile.types.ts'

// TODO: Implement gender, pronoun, picture, album logic

export const createProfile = async (
  req: Request<CreateProfileSchema>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params

  if (!userId) {
    return next(new AppError('validation', 'User ID is required'))
  }

  const profile = await ProfileService.createProfile(userId)

  if (!profile) {
    return next(new AppError('server', 'Something went wrong...'))
  }

  res.status(201).json(profile)
}

export const getProfile = async (
  req: Request<GetProfileSchema>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params
  const profile = await ProfileService.getProfile(userId)

  if (!profile) {
    return next(new AppError('notFound', 'Profile not found'))
  }

  res.status(200).json(profile)
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, age, bio, sexRole } = req.body
    const { id } = req.params
    const updatedProfile: Profile | null = await prisma.profile.update({
      where: { userId: id },
      data: {
        name,
        age: age ? Number(age) : undefined,
        bio,
        sexRole
      }
    })

    if (!updatedProfile) {
      res.status(404).json({ error: 'Profile not found' })
    }

    res.status(200).json(updatedProfile)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' })
    console.error(err)
  }
}
