import supertest from 'supertest'
import nock from 'nock'
import { SetupServer } from '@src/server'
import { Beach, BeachPosition } from '@src/models/beach'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json'
import { User } from '@src/models/user'
import AuthService from '@src/services/auth'

let response: supertest.SuperTest<supertest.Test>
let server: SetupServer
let token: string
const userFake = {
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password'
}

describe('Beach forecast functional tests', () => {
  beforeAll(async () => {
    server = new SetupServer()
    await server.init()
  })

  beforeEach(async () => {
    response = supertest(server.getApp())
    const user = await new User(userFake).save()
    const beachFake: Beach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
      user: user.id
    }
    await new Beach(beachFake).save()
    token = AuthService.generateToken(user.toJSON())
  })

  afterEach(async () => {
    await Beach.deleteMany({})
    await User.deleteMany({})
  })

  afterAll(async () => {
    await server.close()
  })

  it('Should return the forecast for the beaches', async () => {
    const dataSendInRequest = stormGlassWeather3HoursFixture
    const expectedResponse = apiForecastResponse1BeachFixture

    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true
      }
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: -33.792726,
        lng: 151.289824,
        params: /(.*)/,
        source: 'noaa'
      })
      .reply(200, dataSendInRequest)

    const { body, status } = await response
      .get('/forecast')
      .set({ 'x-access-token': token })

    expect(status).toBe(200)
    expect(body).toEqual(expectedResponse)
  })

  it('Should to throw error status code 500 if something goes wrong during the processing', async () => {
    const dataSendInRequest = 'Something went wrong'

    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true
      }
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: -33.792726,
        lng: 151.289824,
        params: /(.*)/,
        source: 'noaa'
      })
      .reply(200, dataSendInRequest)

    const requestResponse = await response
      .get('/forecast')
      .set({ 'x-access-token': token })

    expect(requestResponse.status).toBe(500)
  })
})
