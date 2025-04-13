import {
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_TOKEN_EXPIRATION_TIME,
} from '@/settings.ts'
import { User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import prismaMock from '../lib/__mocks__/prisma.ts'
import * as AuthService from './user.service.ts'

vi.mock('lib/prisma')
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(() => ({
      id: '1',
      email: 'test@example.com',
      role: 'user' as User['role'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  },
}))
vi.mock('@node-rs/bcrypt', () => ({
  default: {
    hashSync: () => 'hashed_random_password',
  },
}))

describe('user.service', () => {
  const env = process.env
  beforeAll(() => {
    vi.restoreAllMocks()
    process.env = { ...env }
  })

  afterAll(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should create a new user.', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_random_password',
      }

      prismaMock.user.create.mockResolvedValue({
        id: '1',
        role: 'user',
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData,
      })

      const user = await AuthService.createUser(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user).toStrictEqual({
        id: '1',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    it('should throw an error if user already exists.', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_random_password',
      }

      prismaMock.user.create.mockRejectedValue(new Error('User already exists'))

      await expect(AuthService.createUser(userData)).rejects.toThrowError(
        'User already exists',
      )
    })

    it('should throw an error if password is not provided.', async () => {
      const userData = {
        email: 'test@example.com',
        password: '',
      }

      prismaMock.user.create.mockRejectedValue(
        new Error('Password is required'),
      )

      await expect(AuthService.createUser(userData)).rejects.toThrowError(
        'Password is required',
      )
    })

    it('should encrypt the password.', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed_random_password',
      }

      prismaMock.user.create.mockResolvedValueOnce({
        id: '1',
        password: 'hashed_random_password',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        refreshToken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await AuthService.createUser(userData)

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: userData,
      })
    })
  })

  describe('generateJWT', () => {
    it('should generate a JWT token.', () => {
      process.env.JWT_SECRET_KEY = 'random_secret_key'

      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'user' as User['role'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      AuthService.createJWT(user)

      expect(jwt.sign).toHaveBeenCalledWith(user, process.env.JWT_SECRET_KEY, {
        expiresIn: JWT_TOKEN_EXPIRATION_TIME,
      })

      expect(jwt.sign).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if JWT_SECRET_KEY is not defined.', () => {
      process.env.JWT_SECRET_KEY = undefined

      expect(() =>
        AuthService.createJWT({} as Omit<User, 'password'>),
      ).toThrow()
    })
  })

  describe('verifyJWT', () => {
    it('should verify a JWT token.', () => {
      process.env.JWT_SECRET_KEY = 'random_secret_key'

      const payload = AuthService.validateJWT('token')

      expect(payload).toBe('1')
      expect(jwt.verify).toHaveBeenCalledWith('token', 'random_secret_key')

      expect(jwt.verify).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if JWT_SECRET_KEY is not defined.', () => {
      process.env.JWT_SECRET_KEY = undefined

      expect(() => AuthService.validateJWT('token')).toThrow()
    })
  })

  describe('createRefreshToken', () => {
    const env = process.env
    beforeAll(() => {
      vi.restoreAllMocks()
      process.env = { ...env }
    })

    afterAll(() => {
      vi.clearAllMocks()
    })

    it('should create a refresh token.', () => {
      process.env.JWT_REFRESH_SECRET_KEY = 'random_secret_key'

      vi.mocked(jwt.sign).mockImplementation(() => 'token')

      AuthService.createRefreshToken('1')

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '1' },
        process.env.JWT_REFRESH_SECRET_KEY,
        {
          expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        },
      )

      expect(jwt.sign).toHaveBeenCalled()
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          refreshToken: {
            push: 'token',
          },
        },
      })
    })

    it('should throw an error if JWT_REFRESH_SECRET_KEY is not defined.', () => {
      process.env.JWT_REFRESH_SECRET_KEY = undefined

      expect(
        async () => await AuthService.createRefreshToken('1'),
      ).rejects.toThrow()
    })
  })

  describe('deleteRefreshToken', () => {
    it('should delete a refresh token.', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        role: 'user' as User['role'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: ['token1', 'token2'],
      }

      await AuthService.deleteRefreshToken(existingUser as User, 'token1')

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          refreshToken: {
            set: existingUser.refreshToken.filter(
              (token) => token !== 'token1',
            ),
          },
        },
      })
    })
  })

  describe('omitSecretFields', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should omit password and refreshToken fields.', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'user' as User['role'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'hashed_random_password',
        refreshToken: ['token1', 'token2'],
      }

      const publicUser = AuthService.omitSecretFields(user)

      expect(publicUser).toBeDefined()
      expect(publicUser.email).toBe(user.email)
      // @ts-expect-error password is not longer a property of User
      expect(publicUser.password).toBeUndefined()
      // @ts-expect-error refreshToken is not longer a property of User
      expect(publicUser.refreshToken).toBeUndefined()
      expect(publicUser).toStrictEqual({
        id: '1',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  })
})
