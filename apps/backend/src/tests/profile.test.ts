import * as bcrypt from '@node-rs/bcrypt'
import { SEXUAL_ROLE } from '@prisma/client'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import app from '../lib/createServer'
import prisma from './helpers/prisma'

describe('Profile', () => {
  beforeEach(async () => {
    await prisma.$transaction([prisma.user.deleteMany()])

    await prisma.user.create({
      data: {
        id: '1',
        email: 'profile@example.com',
        password: bcrypt.hashSync('98Hex$111!'),
      },
    })
  })

  describe('createProfile', () => {
    it('should throw a 404 error if user ID is not provided', async () => {
      // Sign in

      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      // Create Profile
      const { status, body } = await request(app)
        .post('/api/profile/create')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('profile')
    })

    it('should throw an error if user not found.', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      const { status, body } = await request(app)
        .post('/api/profile/9/create')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(400)
      expect(body).not.toHaveProperty('userId')
      expect(body.message).toBe('User not found')
    })

    it('should create profile successfully.', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      const { status, body } = await request(app)
        .post('/api/profile/1/create')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(201)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('userId')
      expect(body).toHaveProperty('name')
      expect(body).toHaveProperty('age')
      expect(body).toHaveProperty('bio')
      expect(body).toHaveProperty('sexRole')
    })
  })

  describe('getProfile', () => {
    beforeEach(async () => {
      await prisma.profile.create({
        data: {
          userId: '1',
          name: 'Profile',
          age: 25,
          bio: 'Bio',
          sexRole: SEXUAL_ROLE.side,
        },
      })
    })

    it('should throw a 404 error if user ID is not provided', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      // Get Profile
      const { status, body } = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('userId')
    })

    it('should throw an error if user not found.', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      const { status, body } = await request(app)
        .get('/api/profile/9')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('userId')
      expect(body.message).toBe('Profile not found')
    })

    describe('should get profile in 2 variants: with name and picture, without name and picture', () => {
      it('should get profile successfully with name and picture.', async () => {
        // Sign in
        const {
          body: { token },
        } = await request(app).post('/api/user/sign-in').send({
          email: 'profile@example.com',
          password: '98Hex$111!',
        })

        expect(token).toBeDefined()

        const { status, body } = await request(app)
          .get('/api/profile/1')
          .set('Authorization', `Bearer ${token}`)
          .send({ onlyNameAndPicture: true })

        expect(status).toBe(200)
        expect(body).toHaveProperty('userId')
        expect(body).toHaveProperty('name')
        expect(body).toHaveProperty('pictures')
        expect(body).not.toHaveProperty('age')
      })

      it('should get profile successfully with full profile info.', async () => {
        // Sign in
        const {
          body: { token },
        } = await request(app).post('/api/user/sign-in').send({
          email: 'profile@example.com',
          password: '98Hex$111!',
        })

        expect(token).toBeDefined()

        const { status, body } = await request(app)
          .get('/api/profile/1')
          .set('Authorization', `Bearer ${token}`)

        expect(status).toBe(200)
        expect(body).toHaveProperty('userId')
        expect(body).toHaveProperty('name')
        expect(body).toHaveProperty('age')
        expect(body).toHaveProperty('bio')
        expect(body).toHaveProperty('sexRole')
      })
    })
  })

  describe('updateProfile', () => {
    beforeEach(async () => {
      await prisma.profile.create({
        data: {
          userId: '1',
          name: 'Profile',
          age: 25,
          bio: 'Bio',
          sexRole: SEXUAL_ROLE.side,
        },
      })
    })

    it('should throw a 404 error if user ID is not provided', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      const { status, body } = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('userId')
    })

    it('should throw an error if user not found.', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      const { status, body } = await request(app)
        .put('/api/profile/9')
        .set('Authorization', `Bearer ${token}`)

      expect(status).toBe(404)
      expect(body).not.toHaveProperty('userId')
      expect(body.message).toBe('Profile not found')
    })

    it('should update profile successfully.', async () => {
      // Sign in
      const {
        body: { token },
      } = await request(app).post('/api/user/sign-in').send({
        email: 'profile@example.com',
        password: '98Hex$111!',
      })

      expect(token).toBeDefined()

      const { status, body } = await request(app)
        .put('/api/profile/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Estoy buscando amigos',
          age: 38,
          bio: 'None of them are my type',
          sexRole: SEXUAL_ROLE.top,
        })

      expect(status).toBe(200)
      expect(body).toHaveProperty('userId')
      expect(body).toHaveProperty('name')
      expect(body.name).toBe('Estoy buscando amigos')
      expect(body).toHaveProperty('age')
      expect(body.age).toBe(38)
      expect(body).toHaveProperty('bio')
      expect(body.bio).toBe('None of them are my type')
      expect(body).toHaveProperty('sexRole')
      expect(body.sexRole).toBe(SEXUAL_ROLE.top)
    })
  })
})
