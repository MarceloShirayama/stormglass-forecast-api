import { User } from '@src/models/user'
import { SetupServer } from '@src/server'
import supertest from 'supertest'

let response: supertest.SuperTest<supertest.Test>
let server: SetupServer

describe('Users functional tests', () => {
  beforeAll(async () => {
    server = new SetupServer()
    await server.init()
    response = supertest(server.getApp())
    await User.deleteMany({})
  })

  afterAll(async () => {
    await server.close()
  })

  describe('When creating a new user', () => {
    it('Should successfully create a new user', async () => {
      const newUser: User = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      const expectedResponse = await response.post('/users').send(newUser)

      expect(expectedResponse.status).toBe(201)
      expect(expectedResponse.body).toEqual(expect.objectContaining(newUser))
    })
  })
})
