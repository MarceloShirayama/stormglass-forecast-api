import supertest from 'supertest'
import nock from 'nock'
import { SetupServer } from '@src/server'
import { Beach, BeachPosition } from '@src/models/beach'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json'

let response: supertest.SuperTest<supertest.Test>
let server: SetupServer
const beach_fake: Beach = {
  lat: -33.792726,
  lng: 151.289824,
  name: 'Manly',
  position: BeachPosition.E
}

describe('Beach forecast functional tests', () => {
  beforeEach(async () => {
    server = new SetupServer()
    await server.init()
    response = supertest(server.getApp())
    await Beach.deleteMany({})
    const beach = new Beach(beach_fake)
    await beach.save()
  })

  afterEach(async () => {
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

    const { body, status } = await response.get('/forecast')

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

    const requestResponse = await response.get('/forecast')

    expect(requestResponse.status).toBe(500)
  })
})
