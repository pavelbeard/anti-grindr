import { describe, expect, it } from 'vitest'

import { AppError } from './utility-classes.ts'

describe('utility-classes', () => {
  describe('AppError', () => {
    it('should create an instance of AppError.', () => {
      const error = new AppError('badRequest', 'Bad request.')

      expect(error instanceof AppError).toBe(true)
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Bad request.')
    })

    it('should return all types of errors.', () => {
      const err1 = new AppError('badRequest', 'Bad request.')
      const err2 = new AppError('validation', 'Validation failed.')
      const err3 = new AppError('unauthorized', 'Unauthorized.')
      const err4 = new AppError('forbidden', 'Forbidden.')
      const err5 = new AppError('notFound', 'Not found.')
      const err6 = new AppError('conflict', 'Conflict.')
      const err7 = new AppError('server', 'Server error.')

      expect(err1.statusCode).toBe(400)
      expect(err2.statusCode).toBe(400)
      expect(err3.statusCode).toBe(401)
      expect(err4.statusCode).toBe(403)
      expect(err5.statusCode).toBe(404)
      expect(err6.statusCode).toBe(409)
      expect(err7.statusCode).toBe(500)
    })
  })
})
