import { InternalError } from '@src/util/errors/internal-error'
import * as HTTPUtil from '@src/util/request'
import { apiConfig } from '@src/envConfig'
import { TimeUtil } from '@src/util/time'
import CacheUtil from '@src/util/cache'
import logger from '@src/logger'

export type StormGlassPointSource = {
  [key: string]: number
}

export type StormGlassPoint = {
  readonly time: string
  readonly waveHeight: StormGlassPointSource
  readonly waveDirection: StormGlassPointSource
  readonly swellDirection: StormGlassPointSource
  readonly swellHeight: StormGlassPointSource
  readonly swellPeriod: StormGlassPointSource
  readonly windDirection: StormGlassPointSource
  readonly windSpeed: StormGlassPointSource
}

export type StormGlassForecastResponse = {
  hours: StormGlassPoint[]
}

export type ForecastPoint = {
  swellDirection: number
  swellHeight: number
  swellPeriod: number
  time: string
  waveDirection: number
  waveHeight: number
  windDirection: number
  windSpeed: number
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass'
    super(`${internalMessage}: ${message}`)
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service'
    super(`${internalMessage}: ${message}`)
  }
}

const stormGlassResourceConfig = apiConfig.resources

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'

  readonly stormGlassAPISource = 'noaa'

  constructor(
    protected request = new HTTPUtil.Request(),
    protected cacheUtil = CacheUtil
  ) {}

  // TODO: add the ability to get the forecast for a specific time
  // TODO: add cache to store this call
  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const cachedForecastPoints = this.getForecastPointsFromCache(
      this.getCacheKey(lat, lng)
    )

    if (!cachedForecastPoints) {
      const forecastPoints = await this.getForecastPointsFromApi(lat, lng)
      this.setForecastPointsInCache(this.getCacheKey(lat, lng), forecastPoints)
      return forecastPoints
    }
    return cachedForecastPoints
  }

  protected async getForecastPointsFromApi(
    lat: number,
    lng: number
  ): Promise<ForecastPoint[]> {
    const endTimestampInDays = apiConfig.resources.endTimestampInDays
    const endTimestamp = TimeUtil.getUnixTimeForAFutureDay(endTimestampInDays)
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.apiUrl}?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=${endTimestamp}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.apiToken
          }
        }
      )
      return this.normalizedResponse(response.data)
    } catch (error: any) {
      if (HTTPUtil.Request.isRequestError(error)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.response?.data)} Code: ${
            error.response?.status
          }`
        )
      }
      throw new ClientRequestError(error.message)
    }
  }

  protected getForecastPointsFromCache(
    key: string
  ): ForecastPoint[] | undefined {
    const forecastPointsFromCache = this.cacheUtil.get<ForecastPoint[]>(key)

    if (!forecastPointsFromCache) return undefined

    logger.info(`Forecast points loaded from cache for key ${key}`)
    return forecastPointsFromCache
  }

  private getCacheKey(lat: number, lng: number): string {
    return `forecast_points_${lat}:${lng}`
  }

  private setForecastPointsInCache(
    key: string,
    forecastPoints: ForecastPoint[]
  ): boolean {
    logger.info(`Updating cache to return forecast points for key: ${key}`)
    return this.cacheUtil.set(key, forecastPoints, apiConfig.cacheTTL)
  }

  private normalizedResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource]
    }))
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    )
  }
}
