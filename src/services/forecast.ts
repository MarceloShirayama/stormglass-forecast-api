import { ForecastPoint, StormGlass } from '@src/clients/stormGlass'

export enum BeachPosition {
  /* eslint-disable no-unused-vars */
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
  /* eslint-enable no-unused-vars */
}

export type Beach = {
  lat: number
  lng: number
  name: string
  position: BeachPosition
  user: string
}

export type BeachForecast = Omit<Beach, 'user'> &
  ForecastPoint & {
    rating: number
  }

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = []

    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
      const enrichedBeachData = points.map((point) => ({
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1
        },
        ...point
      }))

      pointsWithCorrectSources.push(...enrichedBeachData)
    }

    return pointsWithCorrectSources
  }
}
