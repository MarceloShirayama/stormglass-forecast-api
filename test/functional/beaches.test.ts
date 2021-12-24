import supertest from 'supertest'
import { SetupServer } from '@src/server'
import { Beach, BeachPosition } from '@src/models/beach'

let response: supertest.SuperTest<supertest.Test>
let server: SetupServer

describe('Beaches Functional tests', () => {
  // jest.setTimeout(150000)
  beforeAll(async () => {
    server = new SetupServer()
    await server.init()
    response = supertest(server.getApp())
    await Beach.deleteMany({})
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
        position: BeachPosition.E
      }

      const expectedResponse = await response.post('/beaches').send(newBeach)

      expect(expectedResponse.status).toBe(201)
      expect(expectedResponse.body).toEqual(expect.objectContaining(newBeach))
    })
  })
})
