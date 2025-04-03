import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../lib/createServer.ts'
import prisma from './helpers/prisma.ts'

describe('User', () => {
  beforeEach(async () => {
    await prisma.$transaction([prisma.user.deleteMany()])
  })

  describe('[POST] /api/user/sign-up', () => {
    it('should create a new user.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      const newUser = prisma.user.findFirst({
        where: {
          email: 'test@example.com'
        }
      })
      expect(status).toBe(201)
      expect(newUser).not.toBeNull()
      expect(body).toHaveProperty('user')
    })

    it('should throw an error if user already exists.', async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'Ign!is*123'
        }
      })

      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      const count = await prisma.user.count()
      expect(status).toBe(400)
      expect(count).toBe(1)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User already exists.')
    })

    it('should throw an error if password is not match pattern.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'test@example.com',
          password: 'Ignis123'
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Invalid or missing input provided for: password')
    })

    it('should throw an error if email is not valid.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'testexample.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Invalid or missing input provided for: email')
    })

    it('should throw an error if email is not provided.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          username: 'should_i_be_as_email?',
          password: 'Ign!is*123'
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Invalid or missing input provided for: email')
    })

    it('should throw an error if password is not provided.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'test@example.com',
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Invalid or missing input provided for: password')
    })
  })
})
