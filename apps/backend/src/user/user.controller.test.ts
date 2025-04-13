import { AppError } from '@/lib/utility-classes.ts'
import { JWT_HTTP_SECURED } from '@/settings.ts'
import { User } from '@prisma/client'
import type { Request, Response } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as AuthController from './user.controller.ts'
import * as AuthService from './user.service.ts'
import { UpdateEmailSchema, UpdatePasswordSchema } from './user.types.ts'

vi.mock('user/user.service', () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  findByRefreshToken: vi.fn(),
  updateUser: vi.fn(),
  updateUserEmail: vi.fn(),
  updateUserPassword: vi.fn(),
  deleteUser: vi.fn(),
  createJWT: vi.fn(),
  createRefreshToken: vi.fn(),
  deleteRefreshToken: vi.fn(),
  omitSecretFields: vi.fn(),
  validateJWT: vi.fn(),
  comparePassword: vi.fn(),
}))

vi.mock('lib/utility-classes', () => ({
  AppError: class {
    constructor(
      public type: string,
      public message: string,
    ) {}
  },
}))

describe('user.controller', () => {
  let request: Request
  let response: Response
  const next = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()

    response = {
      status: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response

    request = {
      body: {
        email: 'test@example.com',
        password: 'hashed_random_password',
      },
    } as unknown as Request
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('sign-up', () => {
    it('should create a new user.', async () => {
      vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce(null)
      vi.mocked(AuthService.createUser).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        role: 'user' as User['role'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.signUp(request, response, next)

      expect(AuthService.createUser).toHaveBeenCalledWith(request.body)
    })

    it('should throw an error if user already exists.', async () => {
      vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.signUp(request, response, next)

      expect(AuthService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      )
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should respond with a 201 status code and user data.', async () => {
      vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce(null)
      vi.mocked(AuthService.createUser).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        role: 'user' as User['role'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.signUp(request, response, next)

      expect(response.status).toHaveBeenCalledWith(201)
      expect(response.json).toHaveBeenCalledWith({
        message: 'User created successfully.',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user' as User['role'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    })
  })

  describe('sign-in', () => {
    const env = process.env
    beforeEach(() => {
      vi.useFakeTimers()
      process.env = { ...env }
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce(null)

      await AuthController.signIn(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should sign in a user.', async () => {
      vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(AuthService.comparePassword).mockResolvedValueOnce(true)
      vi.mocked(AuthService.omitSecretFields).mockReturnValueOnce({
        id: '1',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(AuthService.createJWT).mockReturnValueOnce('token')
      vi.mocked(AuthService.createRefreshToken).mockResolvedValueOnce(
        'refreshToken',
      )

      await AuthController.signIn(request, response, next)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        user: {
          id: '1',
          email: 'test@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'token',
      })
      expect(response.cookie).toHaveBeenCalledWith(
        '__rclientid',
        'refreshToken',
        {
          httpOnly: true,
          secure: JWT_HTTP_SECURED,
          sameSite: 'strict',
        },
      )
    })

    it('should throw an error if password is wrong.', async () => {
      request.body.password = 'wrong_password'

      vi.mocked(AuthService.findUserByEmail).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.signIn(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBeTypeOf('string')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })
  })

  describe('sign-out', () => {
    beforeEach(() => {
      request.cookies = {
        __rclientid: 'refreshToken',
      }
    })

    it('should throw an error if refresh token is not found in cookies.', async () => {
      request.cookies = {}

      await AuthController.signOut(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Refresh token not found.')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findByRefreshToken).mockResolvedValueOnce(null)

      await AuthController.signOut(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('User not found.')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should sign out the user.', async () => {
      vi.mocked(AuthService.findByRefreshToken).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.signOut(request, response, next)

      expect(response.clearCookie).toHaveBeenCalledWith('__rclientid')
      expect(response.json).toHaveBeenCalledWith({
        message: 'User signed out successfully.',
      })
    })
  })

  describe('refresh-token', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      request.cookies = {
        __rclientid: 'refreshToken',
      }
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should throw an error if refresh token is not found in cookies.', async () => {
      request.cookies = {}

      await AuthController.refreshToken(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Refresh token not found.')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findByRefreshToken).mockResolvedValueOnce(null)

      await AuthController.refreshToken(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('User not found.')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should refresh the token.', async () => {
      vi.mocked(AuthService.findByRefreshToken).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: ['refreshToken'],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(AuthService.omitSecretFields).mockReturnValueOnce({
        id: '1',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(AuthService.createJWT).mockReturnValueOnce('token')
      vi.mocked(AuthService.createRefreshToken).mockResolvedValueOnce(
        'newRefreshToken',
      )

      await AuthController.refreshToken(request, response, next)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.cookie).toHaveBeenCalledWith(
        '__rclientid',
        'newRefreshToken',
        {
          httpOnly: true,
          secure: JWT_HTTP_SECURED,
          sameSite: 'strict',
        },
      )
      expect(response.json).toHaveBeenCalledWith({
        token: 'token',
      })
    })
  })

  describe('getUser', () => {
    beforeEach(() => {
      request.params = { id: '1' }
    })

    afterEach(() => {
      request.params = {}
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findUserById).mockResolvedValueOnce(null)

      await AuthController.getUser(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('User not found.')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should respond with a 200 status code and user data.', async () => {
      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        role: 'user' as User['role'],
        password: 'hashed_random_password',
        refreshToken: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(AuthService.omitSecretFields).mockReturnValueOnce({
        id: '1',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.getUser(request, response, next)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        user: {
          id: '1',
          email: 'test@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    })
  })

  describe('updateEmail', () => {
    beforeEach(() => {
      request.params = { id: '1' }
    })

    afterEach(() => {
      request.params = {}
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findUserById).mockResolvedValueOnce(null)

      await AuthController.updateEmail(
        request as Request<
          UpdateEmailSchema['params'],
          unknown,
          UpdateEmailSchema['body']
        >,
        response,
        next,
      )

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('User not found.')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should throw an error if actual password is wrong.', async () => {
      request.body.actualPassword = 'wrong_password'

      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.updateEmail(
        request as Request<
          UpdateEmailSchema['params'],
          unknown,
          UpdateEmailSchema['body']
        >,
        response,
        next,
      )

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Actual password is wrong.')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it("should update the user's email.", async () => {
      request.body.actualPassword = 'hashed_random_password'
      request.body.newEmail = 'new_email@example.com'

      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(AuthService.comparePassword).mockResolvedValueOnce(true)

      vi.mocked(AuthService.updateUserEmail).mockResolvedValueOnce({
        id: '1',
        email: 'new_email@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(AuthService.omitSecretFields).mockReturnValueOnce({
        id: '1',
        email: 'new_email@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.updateEmail(
        request as Request<
          UpdateEmailSchema['params'],
          unknown,
          UpdateEmailSchema['body']
        >,
        response,
        next,
      )

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        message: 'User email updated successfully.',
        user: {
          id: '1',
          email: 'new_email@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    })
  })

  describe('updatePassword', () => {
    beforeEach(() => {
      request.params = { id: '1' }
    })

    afterEach(() => {
      request.params = {}
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findUserById).mockResolvedValueOnce(null)

      await AuthController.updatePassword(
        request as Request<
          UpdatePasswordSchema['params'],
          unknown,
          UpdatePasswordSchema['body']
        >,
        response,
        next,
      )

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('User not found.')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should throw an error if actual password is wrong.', async () => {
      request.body.actualPassword = 'wrong_password'

      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.updatePassword(
        request as Request<
          UpdatePasswordSchema['params'],
          unknown,
          UpdatePasswordSchema['body']
        >,
        response,
        next,
      )

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Actual password is wrong.')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it("should update the user's password.", async () => {
      request.body.actualPassword = 'hashed_random_password'
      request.body.newPassword = 'new_password'
      request.body.repeatNewPassword = 'new_password'

      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(AuthService.comparePassword).mockResolvedValueOnce(true)

      vi.mocked(AuthService.omitSecretFields).mockReturnValueOnce({
        id: '1',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(AuthService.updateUserPassword).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'new_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.updatePassword(
        request as Request<
          UpdatePasswordSchema['params'],
          unknown,
          UpdatePasswordSchema['body']
        >,
        response,
        next,
      )

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        message: 'User password updated successfully.',
        user: {
          id: '1',
          email: 'test@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    })
  })

  describe('deleteAccount', () => {
    beforeEach(() => {
      request.params = { id: '1' }
      request.cookies = {
        __rclientid: 'refreshToken',
      }
    })

    afterEach(() => {
      request.params = {}
      request.cookies = {}
    })

    it('should throw an error if user not found.', async () => {
      vi.mocked(AuthService.findUserById).mockResolvedValueOnce(null)

      await AuthController.deleteAccount(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('User not found.')
      expect(next.mock.calls[0][0].type).toBe('notFound')
    })

    it('should throw an error if actual password is wrong.', async () => {
      request.body.actualPassword = 'wrong_password'

      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthController.deleteAccount(request, response, next)

      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Actual password is wrong.')
      expect(next.mock.calls[0][0].type).toBe('validation')
    })

    it('should delete the user.', async () => {
      request.body.actualPassword = 'hashed_random_password'

      vi.mocked(AuthService.findUserById).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_random_password',
        role: 'user' as User['role'],
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(AuthService.comparePassword).mockResolvedValueOnce(true)

      await AuthController.deleteAccount(request, response, next)

      expect(response.status).toHaveBeenCalledWith(204)
      expect(response.clearCookie).toHaveBeenCalledWith('__rclientid')
    })
  })
})
