import supertest from 'supertest'
import nock from 'nock'
import { SetupServer } from '@src/server'
import { Beach, BeachPosition } from '@src/models/beach'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'

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

  it('Should return a forecast with just a few times', async () => {
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100
          }
        ]
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T01:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100
          }
        ]
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            time: '2020-04-26T02:00:00+00:00',
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100
          }
        ]
      }
    ]

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
      .reply(200, stormGlassWeather3HoursFixture)

    const { body, status } = await response.get('/forecast')

    expect(status).toBe(200)
    expect(body).toEqual(expectedResponse)
  })
})
