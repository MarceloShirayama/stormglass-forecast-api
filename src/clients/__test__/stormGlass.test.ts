import { StormGlass } from '../stormGlass'
import axios from 'axios'
import stormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json'
import stormGlassNormalized3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json'

jest.mock('axios')

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>

  it('Should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726
    const lng = 151.289824

    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3Hours })

    const stormGlass = new StormGlass(mockedAxios)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(response).toEqual(stormGlassNormalized3Hours)
  })
})
