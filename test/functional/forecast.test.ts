import nock from 'nock'
import { Beach, GeoPosition } from '@src/models/beach'
import { User } from '@src/models/user'
import AuthService from '@src/services/auth'
import { apiConfig } from '@src/envConfig'
import CacheUtil from '@src/util/cache'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json'

let token: string
const userFake = {
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password'
}

describe('Beach forecast functional tests', () => {
  beforeEach(async () => {
    const user = await new User(userFake).save()
    const beachFake: Beach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      userId: user.id
    }
    await new Beach(beachFake).save()
    token = AuthService.generateToken(user.id)
  })

  afterEach(async () => {
    await Beach.deleteMany({})
    await User.deleteMany({})
    CacheUtil.clearAllCache()
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
        source: 'noaa',
        end: /(.*)/
      })
      .reply(200, dataSendInRequest)

    const { body, status } = await global.testRequest
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
        source: 'noaa',
        end: /(.*)/
      })
      .reply(200, dataSendInRequest)

    const requestResponse = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token })

    expect(requestResponse.status).toBe(500)
  })

  it('Should to throw error status code 429 if request limit is exceeded', async () => {
    const dataSendInRequest = stormGlassWeather3HoursFixture
    const limitRate = apiConfig.requestLimit.requestPerHour
    const expectedResponse = {
      code: 429,
      error: 'Too Many Requests',
      message: `exceeded the limit of ${limitRate} request per hour for the /forecast endpoint, try again later`
    }

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
        source: 'noaa',
        end: /(.*)/
      })
      .reply(200, dataSendInRequest)

    let requestTime = 1
    while (requestTime < limitRate) {
      await global.testRequest.get('/forecast').set({ 'x-access-token': token })
      requestTime++
    }

    const response = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token })

    expect(response.status).toBe(429)
    expect(response.body).toEqual(expectedResponse)
  })
})
