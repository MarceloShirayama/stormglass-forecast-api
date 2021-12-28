import { ForecastPoint, StormGlass } from '@src/clients/stormGlass'
import logger from '@src/logger'
import { Beach } from '@src/models/beach'

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
    logger.info(`Processing forecast for ${beaches.length} beaches`)

    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
        const enrichedBeachData = this.enrichedBeachData(points, beach)

        pointsWithCorrectSources.push(...enrichedBeachData)
      }

      return this.mapForecastByTime(pointsWithCorrectSources)
    } catch (error: any) {
      logger.error(error)
      throw new ForecastProcessingInternalError(error.message)
    }
  }

  private enrichedBeachData(points: ForecastPoint[], beach: Beach) {
    return points.map((point) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1
      },
      ...point
    }))
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
