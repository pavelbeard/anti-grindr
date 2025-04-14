import * as bcrypt from '@node-rs/bcrypt'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
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
          password: 'Ign!is*123',
        })

      const newUser = prisma.user.findFirst({
        where: {
          email: 'test@example.com',
        },
      })
      expect(status).toBe(201)
      expect(newUser).not.toBeNull()
      expect(body).toHaveProperty('user')
    })

    it('should throw an error if user already exists.', async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'Ign!is*123',
        },
      })

      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
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
          password: 'Ignis123',
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe(
        'Invalid or missing input provided for: password',
      )
    })

    it('should throw an error if email is not valid.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-up')
        .send({
          email: 'testexample.com',
          password: 'Ign!is*123',
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
          password: 'Ign!is*123',
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
      expect(body.message).toBe(
        'Invalid or missing input provided for: password',
      )
    })
  })

  describe('[POST] /api/user/sign-in', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw an error if user not found.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test1@example.com',
          password: 'Ign!is*123',
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
          password: 'Ign!isX123',
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
          password: 'Ign!is*123',
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
          updatedAt: expect.any(String),
        }),
      )
    })

    it('should contain refresh token in cookies', async () => {
      await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
        })
        .expect('set-cookie', /__rclientid/)
    })
  })

  describe('[POST] /api/user/sign-out', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw a validation error if request is not authorized.', async () => {
      const { status, body } = await request(app)
        .post('/api/user/sign-out')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
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
          password: 'Ign!is*123',
        })

      expect(status).toBe(403)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Token expired or invalid.')
    })

    it('should throw an error if refresh token is not found in cookies.', async () => {
      // 1. SignIn

      const {
        body: { token },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123',
      })

      // 2. SignOut

      const { status, body } = await request
        .agent(app)
        .post('/api/user/sign-out')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
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
        body: { token },
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
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
          password: 'Ign!is*123',
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
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw an error if authorization header is not provided.', async () => {
      const { status, body } = await request(app).post(
        '/api/user/refresh-token',
      )

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if refresh token is not found in cookies.', async () => {
      // 1. SignIn
      const {
        body: { token },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123',
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
        body: { token },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123',
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
        body: { token },
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
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
  }, 10000)

  describe('[GET] /api/user/:id', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw an error if authorization header is not provided.', async () => {
      const { status, body } = await request(app).get('/api/user/:id')

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if user not found.', async () => {
      // 1. SignIn
      const {
        body: { token },
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
        })
        .timeout(10000)

      // 2. GetUser

      const { status, body } = await request
        .agent(app)
        .get('/api/user/sdkfsjdflkds')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User not found.')
    })

    it('should get user successfully.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123',
      })

      // 2. GetUser

      const { status, body } = await request
        .agent(app)
        .get(`/api/user/${id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(200)
      expect(body).toHaveProperty('user')
      expect(body.user).toHaveProperty('id')
      expect(body.user).toHaveProperty('email')
      expect(body.user).toHaveProperty('createdAt')
      expect(body.user).toHaveProperty('updatedAt')
      expect(body.user).not.toHaveProperty('password')
    })
  })

  describe('[PATCH] /api/user/:id/update-email', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test10@example.com',
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw an error if authorization header is not provided.', async () => {
      // 1. SignIn
      const {
        body: {
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test10@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdateEmail

      const { status, body } = await request(app).patch(
        `/api/user/${id}/update-email`,
      )

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if data is invalid.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test10@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdateEmail

      const { status, body } = await request
        .agent(app)
        .patch(`/api/user/${id}/update-email`)
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe(
        'Invalid or missing inputs provided for: newEmail, actualPassword',
      )
    })

    it('should throw an error if user not found.', async () => {
      // 1. SignIn
      const {
        body: { token },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test10@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdateEmail

      const { status, body } = await request
        .agent(app)
        .patch('/api/user/sdkfsjdflkds/update-email')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newEmail: 'test@example.com',
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User not found.')
    })

    it('should update email successfully.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test10@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdateEmail

      const { status, body } = await request
        .agent(app)
        .patch(`/api/user/${id}/update-email`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          newEmail: 'test@example10.com',
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(200)
      expect(body).toHaveProperty('user')
      expect(body.user).toHaveProperty('email')
      expect(body.user.email).toBe('test@example10.com')
    })
  })

  describe('[PATCH] /api/user/:id/update-password', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'model22@example.com',
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw an error if authorization header is not provided.', async () => {
      // 1. SignIn
      const {
        body: {
          user: { id },
        },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'model22@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdatePassword

      const { status, body } = await request(app).patch(
        `/api/user/${id}/update-password`,
      )

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if data is invalid.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'model22@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdatePassword

      const { status, body } = await request
        .agent(app)
        .patch(`/api/user/${id}/update-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'Ign!is*123',
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe(
        'Invalid or missing input provided for: repeatNewPassword',
      )
    })

    it('should throw an error if user not found.', async () => {
      // 1. SignIn
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'model22@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdatePassword

      const { status, body } = await request(app)
        .patch('/api/user/sdkfsjdflkds/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'Ign!is*123',
          actualPassword: 'Ign!is*123',
          repeatNewPassword: 'Ign!is*123',
        })

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User not found.')
    })

    it('should throw an error if actual password is wrong.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'model22@example.com',
        password: 'Ign!is*123',
      })

      // 2. UpdatePassword

      const { status, body } = await request
        .agent(app)
        .patch(`/api/user/${id}/update-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          actualPassword: 'Ign!is*999',
          newPassword: 'Ign!is*444',
          repeatNewPassword: 'Ign!is*444',
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Actual password is wrong.')
    })

    it('should update password successfully.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'model22@example.com',
        password: 'Ign!is*123',
      })

      expect(token).toBeDefined()
      expect(id).toBeDefined()

      // 2. UpdatePassword

      const { status, body } = await request
        .agent(app)
        .patch(`/api/user/${id}/update-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          actualPassword: 'Ign!is*123',
          newPassword: 'Ign!is*999',
          repeatNewPassword: 'Ign!is*999',
        })

      expect(status).toBe(200)
      expect(body).toHaveProperty('token')
      expect(body).toHaveProperty('user')
      expect(body.user).toHaveProperty('email')
      expect(body.user.email).toBe('model22@example.com')
    }, 10000)
  })

  describe('[DELETE] /api/user/:id', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: bcrypt.hashSync('Ign!is*123'),
        },
      })
    })

    it('should throw an error if authorization header is not provided.', async () => {
      // 1. SignIn
      const {
        body: {
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123',
      })

      // 2. DeleteAccount

      const { status, body } = await request
        .agent(app)
        .delete(`/api/user/${id}`)
        .send({
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(401)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('`Authorization` header is required.')
    })

    it('should throw an error if refresh token is absent.', async () => {
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request.agent(app).post('/api/user/sign-in').send({
        email: 'test@example.com',
        password: 'Ign!is*123',
      })

      // 2. DeleteAccount

      const { status, body } = await request
        .agent(app)
        .delete(`/api/user/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Refresh token not found.')
    })

    it('should throw an error if user not found.', async () => {
      let refreshToken
      // 1. SignIn
      const {
        body: { token },
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
        })
        .then((res) => {
          refreshToken = res.headers['set-cookie'][0]
            .split(';')[0]
            .split('=')[1]
          return res
        })

      // 2. DeleteAccount

      const { status, body } = await request
        .agent(app)
        .delete('/api/user/sdkfsjdflkds')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', `__rclientid=${refreshToken}`)
        .send({
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('User not found.')
    })

    it('should throw an error if actual password is wrong.', async () => {
      let refreshToken
      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request
        .agent(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
        })
        .then((res) => {
          refreshToken = res.headers['set-cookie'][0]
            .split(';')[0]
            .split('=')[1]
          return res
        })

      // 2. DeleteAccount

      const { status, body } = await request
        .agent(app)
        .delete(`/api/user/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', `__rclientid=${refreshToken}`)
        .send({
          actualPassword: 'Ign!is*999',
        })

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('user')
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Actual password is wrong.')
    })

    it('should delete account successfully.', async () => {
      let refreshToken

      // 1. SignIn
      const {
        body: {
          token,
          user: { id },
        },
      } = await request(app)
        .post('/api/user/sign-in')
        .send({
          email: 'test@example.com',
          password: 'Ign!is*123',
        })
        .then((res) => {
          refreshToken = res.headers['set-cookie'][0]
            .split(';')[0]
            .split('=')[1]
          return res
        })

      // 2. DeleteAccount

      const { status } = await request(app)
        .delete(`/api/user/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', `__rclientid=${refreshToken}`)
        .send({
          actualPassword: 'Ign!is*123',
        })

      expect(status).toBe(204)
    })
  })
})
