import prisma from '@/lib/prisma.ts'
import { Prisma, User } from '@prisma/client'

export const createProfile = async (userId: User['id']) => {
  return await prisma.profile.create({
    data: {
      userId,
    },
  })
}

export const findProfileByUserId = async (userId: User['id']) => {
  return await prisma.profile.findUnique({
    where: { userId },
    include: {
      genders: {
        select: { name: true },
      },
      pronouns: {
        select: { name: true },
      },
      pictures: {
        select: { albumId: true, url: true },
        orderBy: { order: 'asc' },
      },
      albums: {
        select: { id: true, profileId: true, name: true },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export const findProfileNameAndMainPicture = async (userId: User['id']) => {
  return await prisma.profile.findUnique({
    where: { userId },
    select: {
      userId: true,
      name: true,
      pictures: { take: 1 },
    },
  })
}

// Is it PATCH or PUT ???
export const updateProfile = async (
  userId: User['id'],
  data: Prisma.ProfileUpdateInput,
) => {
  return await prisma.profile.update({
    where: { userId },
    data,
  })
}
