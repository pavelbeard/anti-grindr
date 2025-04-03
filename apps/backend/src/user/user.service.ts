import prisma from '@/lib/prisma.ts'
import {
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_TOKEN_EXPIRATION_TIME
} from '@/settings.ts'
import { CreateUserSchema, PublicUser } from '@/user/user.types.ts'
import bcrypt from '@node-rs/bcrypt'
import { User } from '@prisma/client'
import jwt from 'jsonwebtoken'

export const createUser = async (user: CreateUserSchema) => {
  user.password = bcrypt.hashSync(user.password, 10)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { refreshToken, password, ...createdUser } = await prisma.user.create({
    data: user
  })

  return createdUser
}

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id }
  })
}

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export const findByRefreshToken = async (refreshToken: string) => {
  return await prisma.user.findFirst({
    where: {
      refreshToken: {
        has: refreshToken
      }
    }
  })
}

export const updateUser = async (id: string, data: User) => {
  return await prisma.user.update({
    where: { id },
    data
  })
}

export const updateUserEmail = async (id: string, email: string) => {
  return await prisma.user.update({
    where: { id },
    data: { email }
  })
}

export const updateUserPassword = async (id: string, password: string) => {
  return await prisma.user.update({
    where: { id },
    data: { password }
  })
}

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id }
  })
}

export const createJWT = (payload: PublicUser) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined')
  }

  return jwt.sign({ ...payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: JWT_TOKEN_EXPIRATION_TIME
  })
}

export const createRefreshToken = async (userId: User['id']) => {
  if (!process.env.JWT_REFRESH_SECRET_KEY) {
    throw new Error('JWT_REFRESH_SECRET_KEY is not defined')
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: {
        push: token
      }
    }
  })

  return token
}

export const deleteRefreshToken = async (
  existingUser: User,
  refreshToken: string
) => {
  return await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      refreshToken: {
        set: existingUser?.refreshToken?.filter(
          (token) => token !== refreshToken
        )
      }
    }
  })
}

export const omitSecretFields = (user: User): PublicUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, refreshToken, role, ...publicUser } = user
  return publicUser
}

export const validateJWT = (token: string) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined')
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY) as {
    id: string
  }
  return payload.id
}

export const comparePassword = (input: string, encrypted: string) => {
  return bcrypt.compareSync(input, encrypted)
}
