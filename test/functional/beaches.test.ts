import { Beach, GeoPosition } from '@src/models/beach'
import { User } from '@src/models/user'
import { SetupServer } from '@src/server'
import AuthService from '@src/services/auth'
import supertest from 'supertest'

let request: supertest.SuperTest<supertest.Test>
let server: SetupServer
let userId: string

describe('Beaches Functional tests', () => {
  // jest.setTimeout(150000)
  const userFake = {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  }
  let token: string

  beforeAll(async () => {
    server = new SetupServer()
    await server.init()
    request = supertest(server.getApp())
  })

  beforeEach(async () => {
    const user = await new User(userFake).save()
    userId = user.id
    token = AuthService.generateToken(userId)
  })

  afterEach(async () => {
    await Beach.deleteMany({})
    await User.deleteMany({})
  })

  afterAll(async () => {
    await server.close()
    // await new Promise<void>((resolve) => setTimeout(() => resolve(), 5000))
  })

  describe('When creating a beach', () => {
    it('Should create a beach with success', async () => {
      const newBeach: Beach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        userId
      }

      const response = await request
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(newBeach))
    })

    it('Should return a 400 when token is not provider', async () => {
      const newBeach: Beach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        userId
      }

      const response = await request.post('/beaches').send(newBeach)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: `request.headers should have required property 'x-access-token'`,
        code: 400,
        error: 'Bad Request'
      })
    })

    it('Should return a 400 when beach is not provider', async () => {
      const response = await request.post('/beaches')

      expect(response.status).toBe(415)
      expect(response.body).toEqual({
        message: 'unsupported media type undefined',
        code: 415,
        error: 'Unsupported Media Type'
      })
    })

    it('should return 500 when there is any error other than validation error', async () => {
      jest
        .spyOn(Beach.prototype, 'save')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('failed to create beach'))
        )
      const newBeach: Beach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        userId
      }
      const response = await request
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        code: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong!'
      })
    })
  })
})
