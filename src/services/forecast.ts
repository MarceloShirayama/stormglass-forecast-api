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

export type TimeForecast = {
  time: string
  forecast: BeachForecast[]
}

export class ForecastProcessingInternalError extends Error {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`)
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = []

    try {
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

      return this.mapForecastByTime(pointsWithCorrectSources)
    } catch (err: any) {
      throw new ForecastProcessingInternalError(err.message)
    }
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = []

    for (const point of forecast) {
      const timePoint = forecastByTime.find((t) => t.time === point.time)
      if (timePoint) {
        timePoint.forecast.push(point)
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }
    return forecastByTime
  }
}
