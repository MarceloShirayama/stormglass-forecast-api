import _ from 'lodash'
import { ForecastPoint, StormGlass } from '@src/clients/stormGlass'
import logger from '@src/logger'
import { Beach } from '@src/models/beach'
import { Rating } from './rating'

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
  constructor(
    protected stormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      const beachesForecast = await this.calculateRating(beaches)
      const timeForecast = this.mapForecastByTime(beachesForecast)
      return timeForecast.map((listOfBeaches) => ({
        time: listOfBeaches.time,
        // TODO: allow ordering to be dynamically
        forecast: _.orderBy(listOfBeaches.forecast, 'rating', 'desc')
      }))
    } catch (error: any) {
      logger.error(error)
      throw new ForecastProcessingInternalError(error.message)
    }
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ) {
    return points.map((point) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRateForPoint(point)
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

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = []
    logger.info(`Processing forecast for ${beaches.length} beaches`)

    for (const beach of beaches) {
      const rating = new this.RatingService(beach)
      // TODO: call stormglass only once for all beaches, in parallel with promiseAll
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
      const enrichedBeachData = this.enrichedBeachData(points, beach, rating)

      pointsWithCorrectSources.push(...enrichedBeachData)
    }

    return pointsWithCorrectSources
  }
}
