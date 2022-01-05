import { User } from '@src/models/user'
import AuthService from '@src/services/auth'

describe('Users functional tests', () => {
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

      const response = await global.testRequest.post('/users').send(newUser)

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

      let response = await global.testRequest.post('/users').send(newUser)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'User validation failed: name: Path `name` is required.'
      })

      const newUser2 = {
        name: 'any_user',
        password: '12345'
      }

      response = await global.testRequest.post('/users').send(newUser2)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'User validation failed: email: Path `email` is required.'
      })

      const newUser3 = {
        name: 'any_user',
        email: 'any_email@mail.com'
      }

      response = await global.testRequest.post('/users').send(newUser3)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message:
          'User validation failed: password: Path `password` is required.'
      })
    })

    it('Should throw error 409 when email already exists', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      await global.testRequest.post('/users').send(newUser)

      const response = await global.testRequest.post('/users').send(newUser)

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        code: 409,
        error: 'Conflict',
        message: 'User validation failed: email: Email already in use'
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

      const user = await new User(newUser).save()

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: passBeforeHash })
      const jwtClaims = AuthService.decodeToken(response.body.token)

      expect(jwtClaims).toMatchObject({ sub: user.id })
    })

    it('Should return Unauthorized if incorrect user email', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: 'invalid_email@mail.com', password: 'any_password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'Incorrect email or password'
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

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: 'invalid_password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'Incorrect email or password'
      })
    })
  })

  describe('When getting user profile info', () => {
    it(`Should return the token's owner profile information`, async () => {
      const newUser = {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      newUser.password = await AuthService.hashPassword(newUser.password)

      const user = await new User(newUser).save()
      const token = AuthService.generateToken(user.id)
      const userProfile = {
        name: newUser.name,
        email: newUser.email
      }

      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token })

      expect(status).toBe(200)
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ userProfile })))
    })

    it(`Should throw Not Found, when the user is not found`, async () => {
      const token = AuthService.generateToken('invalid_user_id')

      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token })

      expect(status).toBe(404)
      expect(body.message).toBe('User not found!')
    })
  })
})
