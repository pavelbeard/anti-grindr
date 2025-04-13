import prisma from '@/lib/prisma.ts'
import { Prisma, Profile, User } from '@prisma/client'

export const createProfile = async (userId: User['id']) => {
  return await prisma.profile.create({
    data: {
      userId,
    },
  })
}

export const getProfileByUserId = async (userId: User['id']) => {
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

export const getProfileNameAndMainPicture = async (userId: User['id']) => {
  return await prisma.profile.findUnique({
    where: { userId },
    select: {
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
  const profile: Profile | null = await prisma.profile.update({
    where: { userId },
    data,
  })

  return profile
}
