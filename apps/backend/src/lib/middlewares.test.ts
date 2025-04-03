import { vi, it, expect, beforeEach, afterEach, describe } from 'vitest'
import {
  authorization,
  errorFallback,
  originResolver,
  validate
} from './middlewares.ts'
import type { Request, Response } from 'express'
import { AppError } from './utility-classes.ts'
import * as AuthService from '../user/user.service.ts'
import { z } from 'zod'

vi.mock('user/user.service', () => ({
  validateJWT: vi.fn()
}))

describe('middlewares', () => {
  const env = process.env

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...env }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('authorization', () => {
    const request = {
      method: 'OPTIONS'
    } as unknown as Request<unknown>
    const response = {
      send: vi.fn().mockReturnThis(),
      session: {
        userId: null
      }
    } as unknown as Response
    const next = vi.fn()

    process.env.JWT_SECRET_KEY = 'secret'

    it('should send a preflight response.', () => {
      authorization(request, response, next)

      expect(response.send).toHaveBeenCalledWith({
        message: 'Preflight checked successfully.'
      })
    })

    it('should throw an error if JWT_SECRET_KEY is not defined.', () => {
      process.env.JWT_SECRET_KEY = undefined
      request.method = 'POST'

      authorization(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('unauthorized', 'JWT secret key is not defined.')
      )
    })

    it('should throw an error if `Authorization` header is not provided.', () => {
      request.method = 'POST'
      request.headers = {}

      authorization(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('unauthorized', '`Authorization` header is required.')
      )
    })

    it('should throw an error if `Authorization` header has invalid token.', () => {
      request.method = 'POST'
      request.headers = {
        authorization: 'Bearer invalid_token'
      }

      vi.mocked(AuthService.validateJWT).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      authorization(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('forbidden', 'Token expired or invalid.')
      )
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Token expired or invalid.')
      expect(next.mock.calls[0][0].statusCode).toBe(403)
    })

    it('should throw an error if `Authorization` header has empty token.', () => {
      request.method = 'POST'
      request.headers = {
        authorization: 'Bearer '
      }

      authorization(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('unauthorized', 'Invalid access token.')
      )
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe('Invalid access token.')
      expect(next.mock.calls[0][0].statusCode).toBe(401)
    })

    it('should accept a valid token.', () => {
      request.method = 'POST'
      request.headers = {
        authorization: 'Bearer valid_token'
      }

      vi.mocked(AuthService.validateJWT).mockImplementation(() => '1')

      authorization(request, response, next)

      expect(AuthService.validateJWT).toHaveBeenCalledWith('valid_token')
      expect(response.session.userId).toBe('1')
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('originResolver', () => {
    const callback = vi.fn()

    it('should throw an error if allowed origins is empty.', () => {
      originResolver([], 'https://example.com', callback)

      expect(callback).toHaveBeenCalledWith(
        new AppError('badRequest', 'Not allowed by CORS')
      )
    })

    it('should throw an error if origin is not allowed.', () => {
      originResolver(['https://example.com'], 'https://example.org', callback)

      expect(callback).toHaveBeenCalledWith(
        new AppError('badRequest', 'Not allowed by CORS')
      )
    })

    it('should allow allowed origins.', () => {
      originResolver(['https://example.com'], 'https://example.com', callback)

      expect(callback).toHaveBeenCalledWith(null, true)
    })
  })

  describe('errorFallback', () => {
    let request: Request
    let response: Response

    beforeEach(() => {
      vi.restoreAllMocks()
      response = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      request = {} as Request
    })

    it('should send a response with the error message (500).', () => {
      errorFallback(
        new Error('Internal Server Error'),
        request,
        response,
        () => {}
      )

      expect(response.status).toHaveBeenCalledWith(500)
      expect(response.json).toHaveBeenCalledWith({
        message: 'Internal Server Error'
      })
    })

    it('should throw a response with the error message (409).', () => {
      const error = new AppError('conflict', 'Conflict.')
      errorFallback(error, request, response, () => {})

      expect(response.status).toHaveBeenCalledWith(409)
      expect(response.json).toHaveBeenCalledWith({
        message: 'Conflict.'
      })
    })
  })

  describe('validate', () => {
    let request: Request
    let response: Response
    const next = vi.fn()

    beforeEach(() => {
      vi.restoreAllMocks()
      response = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      request = {} as Request
    })

    it('should throw an error if validation fails.', async () => {
      request.body = {}
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8)
        })
      })

      await validate(schema)(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError(
          'validation',
          'Invalid or missing inputs provided for: email, password'
        )
      )
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError)
      expect(next.mock.calls[0][0].message).toBe(
        'Invalid or missing inputs provided for: email, password'
      )
      expect(next.mock.calls[0][0].statusCode).toBe(400)
    })

    it('should pass if validation is successful.', async () => {
      request.body = {
        email: 'test@example.com',
        password: 'password123'
      }
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8)
        })
      })

      await validate(schema)(request, response, next)

      expect(next).toHaveBeenCalledWith()
    })
  })
})
