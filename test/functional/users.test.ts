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
  })

  afterAll(async () => {
    await server.close()
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('When creating a new user', () => {
    it('Should successfully create a new user', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: 'any_password'
      }

      const expectedResponse = await response.post('/users').send(newUser)

      expect(expectedResponse.status).toBe(201)
      expect(expectedResponse.body).toEqual(expect.objectContaining(newUser))
    })

    it('Should throw error when there is a mongoose validation error', async () => {
      const newUser = {
        name: 'any_user',
        email: 'any_email@mail.com',
        password: '1234'
      }

      let expectedResponse = await response.post('/users').send(newUser)

      expect(expectedResponse.status).toBe(400)
      // expect contain 'User validation failed: password:' in string
      expect(expectedResponse.text).toContain(
        'User validation failed: password:'
      )

      newUser.password = '1234567890123456789'
      console.log(newUser)

      expectedResponse = await response.post('/users').send(newUser)

      expect(expectedResponse.status).toBe(400)
      // expect contain 'User validation failed: password:' in string
      expect(expectedResponse.text).toContain(
        'User validation failed: password:'
      )

      const newUser2 = {
        email: 'any_email@mail.com',
        password: '12345'
      }

      expectedResponse = await response.post('/users').send(newUser2)

      expect(expectedResponse.status).toBe(400)
      expect(expectedResponse.text).toContain('User validation failed:')

      const newUser3 = {
        name: 'any_user',
        password: '12345'
      }

      expectedResponse = await response.post('/users').send(newUser3)

      expect(expectedResponse.status).toBe(400)
      expect(expectedResponse.text).toContain('User validation failed:')

      const newUser4 = {
        name: 'any_user',
        email: 'any_email@mail.com'
      }

      expectedResponse = await response.post('/users').send(newUser4)

      expect(expectedResponse.status).toBe(400)
      expect(expectedResponse.text).toContain('User validation failed:')
    })
  })
})
