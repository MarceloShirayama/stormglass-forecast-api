import { User } from '@src/models/user'
import { SetupServer } from '@src/server'
import AuthService from '@src/services/auth'
import supertest from 'supertest'

let request: supertest.SuperTest<supertest.Test>
let server: SetupServer

describe('Users functional tests', () => {
  beforeAll(async () => {
    server = new SetupServer()
    await server.init()
    request = supertest(server.getApp())
  })

  afterAll(async () => {
    await server.close()
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  describe('When creating a new user', () => {
    it('Should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      const response = await request.post('/users').send(newUser)

      expect(response.status).toBe(201)
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy()
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) }
        })
      )
    })

    it('Should throw error when there is a mongoose validation error', async () => {
      const newUser = {
        email: 'any_email@mail.com',
        password: '12345'
      }

      let response = await request.post('/users').send(newUser)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: name: Path `name` is required.'
      })

      const newUser2 = {
        name: 'any_user',
        password: '12345'
      }

      response = await request.post('/users').send(newUser2)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: email: Path `email` is required.'
      })

      const newUser3 = {
        name: 'any_user',
        email: 'any_email@mail.com'
      }

      response = await request.post('/users').send(newUser3)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: password: Path `password` is required.'
      })
    })

    it('Should throw error 409 when email already exists', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      await request.post('/users').send(newUser)

      const response = await request.post('/users').send(newUser)

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: Email already in use'
      })
    })
  })

  describe('When authenticate a user', () => {
    it('Should generate a valid token for user', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      const passBeforeHash = newUser.password

      newUser.password = await AuthService.hashPassword(newUser.password)

      await new User(newUser).save()

      const response = await request
        .post('/users/authenticate')
        .send({ email: newUser.email, password: passBeforeHash })

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      )
    })

    it('Should return Unauthorized if incorrect user email', async () => {
      const response = await request
        .post('/users/authenticate')
        .send({ email: 'invalid_email@mail.com', password: 'any_password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 401,
        error: 'Incorrect email or password'
      })
    })

    it('Should return Unauthorized if incorrect user password', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      newUser.password = await AuthService.hashPassword(newUser.password)

      await new User(newUser).save()

      const response = await request
        .post('/users/authenticate')
        .send({ email: newUser.email, password: 'invalid_password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 401,
        error: 'Incorrect email or password'
      })
    })
  })
})
