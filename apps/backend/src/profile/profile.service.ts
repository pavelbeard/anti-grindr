import { Prisma, Profile, User } from '@prisma/client'
import prisma from '@/lib/prisma.ts'

export const createProfile = async (userId: User['id']) => {
  const profile: Profile | null = await prisma.profile.create({
    data: {
      userId
    }
  })

  return profile
}

export const getProfile = async (userId: User['id']) => {
  const profile: Profile | null = await prisma.profile.findUnique({
    where: { userId },
    include: {
      genders: true,
      pronouns: true,
      pictures: { orderBy: { order: 'asc' } },
      albums: { orderBy: { order: 'asc' } }
    }
  })

  return profile
}

export const getProfileNameAndMainPicture = async (userId: User['id']) => {
  const profile: Profile | null = await prisma.profile.findUnique({
    where: { userId },
    include: {
      pictures: { take: 1 }
    }
  })

  return profile
}

// Is it PATCH or PUT ???
export const updateProfile = async (
  userId: User['id'],
  data: Prisma.ProfileUpdateInput
) => {
  const profile: Profile | null = await prisma.profile.update({
    where: { userId },
    data
  })

  return profile
}
