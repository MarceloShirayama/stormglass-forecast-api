import supertest from 'supertest'
import { SetupServer } from '@src/server'
import { Beach, BeachPosition } from '@src/services/forecast'

let response: supertest.SuperTest<supertest.Test>
let server: SetupServer

describe('Beaches Functional tests', () => {
  beforeAll(async () => {
    server = new SetupServer()
    await server.init()
    response = supertest(server.getApp())
  })

  afterAll(async () => {
    await server.close()
  })
  describe('When creating a beach', () => {
    it('Should create a beach with success', async () => {
      const newBeach: Beach = {
        user: 'any_user',
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E
      }

      const expectedResponse = await response.post('/beaches').send(newBeach)

      expect(expectedResponse.status).toBe(201)
      expect(expectedResponse.body).toEqual(expect.objectContaining(newBeach))
    })
  })
})
