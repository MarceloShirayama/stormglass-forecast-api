import { StormGlass } from '../stormGlass'
import * as HTTPUtil from '@src/util/request'
import CacheUtil from '@src/util/cache'
import stormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json'
import stormglass_normalized_response_3_hours from '@test/fixtures/stormglass_normalized_response_3_hours.json'

jest.mock('@src/util/request')
const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
  typeof HTTPUtil.Request
>
const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>
jest.mock('@src/util/cache')
const mockedCacheUtil = CacheUtil as jest.Mocked<typeof CacheUtil>

describe('StormGlass client', () => {
  it('Should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726
    const lng = 151.289824

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3Hours
    } as HTTPUtil.Response)

    mockedCacheUtil.get.mockReturnValue(undefined)
    const stormGlass = new StormGlass(mockedRequest, mockedCacheUtil)

    const response = await stormGlass.fetchPoints(lat, lng)

    expect(response).toEqual(stormglass_normalized_response_3_hours)
  })

  it('Should exclude incomplete data points', async () => {
    const lat = -33.792726
    const lng = 151.289824
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300
          },
          time: '2020-04-26T00:00:00+00:00'
        }
      ]
    }
    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse
    } as HTTPUtil.Response)

    mockedCacheUtil.get.mockReturnValue(undefined)
    const stormGlass = new StormGlass(mockedRequest, mockedCacheUtil)

    const response = await stormGlass.fetchPoints(lat, lng)

    expect(response).toEqual([])
  })

  it('should get the normalized forecast points from cache and use it to return data points', async () => {
    const lat = -33.792726
    const lng = 151.289824

    mockedRequest.get.mockResolvedValue({ data: null } as HTTPUtil.Response)

    mockedCacheUtil.get.mockReturnValue(stormglass_normalized_response_3_hours)

    const stormGlass = new StormGlass(mockedRequest, mockedCacheUtil)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(response).toEqual(stormglass_normalized_response_3_hours)
  })

  it('Should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726
    const lng = 151.289824

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' })

    mockedCacheUtil.get.mockReturnValue(undefined)
    const stormGlass = new StormGlass(mockedRequest, mockedCacheUtil)

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    )
  })

  it('Should get an StormGlassResponseError when StormGlass service responds with error', async () => {
    const lat = -33.792726
    const lng = 151.289824

    MockedRequestClass.isRequestError.mockReturnValue(true)
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] }
      }
    })

    const stormGlass = new StormGlass(mockedRequest)

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    )
  })
})
