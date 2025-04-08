import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../lib/createServer.ts'
import prisma from './helpers/prisma.ts'
import * as bcrypt from '@node-rs/bcrypt'

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
      expect(body.message).toBe(
        'Invalid or missing input provided for: password'
      )
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
          email: 'test@example.com'
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe(
        'Invalid or missing input provided for: password'
      )
    })
  })

  describe('[POST] /api/user/sign-in', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123')
        }
      })
    })

    it('should throw an error if user not found.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test1@example.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User not found.')
    })

    it('should throw an error if password is wrong.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!isX123'
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Password is wrong.')
    })

    it('should contain public user and token', async () => {
      const { status, body } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(200)
      expect(body).toHaveProperty('user')
      expect(body).toHaveProperty('token')
      expect(body.user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          isActive: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })

    it('should contain refresh token in cookies', async () => {
      await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })
        .expect('set-cookie', /__rclientid/)
    })
  })

  describe('[POST] /api/user/sign-out', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123')
        }
      })
    })

    it('should throw a validation error if request is not authorized.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-out')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if provided invalid token.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-out')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(403)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Token expired or invalid.')
    })

    it('should throw an error if refresh token is not found in cookies.', async () => {
      // 1. SignIn

      const {
        body: { token }
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123'
      })

      // 2. SignOut

      const { status, body } = await request
        .agent(app)
        .post('/api/user/sign-out')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Refresh token not found.')
    })

    it('should sign out successfully.', async () => {
      // 1. SignIn

      let refreshToken

      const {
        body: { token }
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })
        .then((res) => {
          refreshToken = res.headers['set-cookie'][0]
            .split(';')[0]
            .split('=')[1]
          return res
        })

      // 2. SignOut
      const { status, body } = await request
        .agent(app)
        .post('/api/user/sign-out')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', `__rclientid=${refreshToken}`)
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })

      expect(status).toBe(200)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User signed out successfully.')
    })
  })

  describe('[POST] /api/user/refresh-token', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123')
        }
      })
    })

    it('should throw an error if authorization header is not provided.', async () => {
      const { status, body } = await request(app).post(
        '/api/user/refresh-token'
      )

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if refresh token is not found in cookies.', async () => {
      // 1. SignIn
      const {
        body: { token }
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123'
      })

      // 2. RefreshToken

      const { status, body } = await request(app)
        .post('/api/user/refresh-token')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Refresh token not found.')
    })

    it('should throw an error if user not found.', async () => {
      // 1. SignIn
      const {
        body: { token }
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123'
      })

      // 2. RefreshToken

      const { status, body } = await request
        .agent(app)
        .post('/api/user/refresh-token')
        .set('Cookie', `__rclientid=invalid_token`)
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User not found.')
    })

    it('should refresh token successfully.', async () => {
      let refreshToken

      // 1. SignIn
      const {
        body: { token }
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123'
        })
        .then((res) => {
          refreshToken = res.headers['set-cookie'][0]
            .split(';')[0]
            .split('=')[1]
          return res
        })

      // 2. RefreshToken

      const { status, body } = await request
        .agent(app)
        .post('/api/user/refresh-token')
        .set('Cookie', `__rclientid=${refreshToken}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('set-cookie', /__rclientid/)

      expect(status).toBe(200)
      expect(body).toHaveProperty('token')
    })
  })
})
