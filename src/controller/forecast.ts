import { ClassMiddleware, Controller, Get } from '@overnightjs/core'
import { apiConfig } from '@src/envConfig'
import logger from '@src/logger'
import { authMiddleware } from '@src/middlewares/auth'
import { Beach } from '@src/models/beach'
import { Forecast } from '@src/services/forecast'
import ApiError from '@src/util/errors/api-error'
import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { BaseController } from '.'

const forecast = new Forecast()

const requestsPerHour = apiConfig.requestLimit.requestPerHour

const limiter = rateLimit({
  windowMs: apiConfig.requestLimit.windowMs,
  max: requestsPerHour + 1,
  keyGenerator: (req: Request) => req.ip,
  handler: (req: Request, res: Response): void => {
    logger.warn(
      `${req.ip} has been blocked for hitting request limit for /forecast endpoint `
    )
    res.status(429).send(
      ApiError.formatError({
        code: 429,
        message: `exceeded the limit of ${requestsPerHour} request per hour for the /forecast endpoint, try again later`
      })
    )
  }
})

@Controller('forecast')
@ClassMiddleware([authMiddleware, limiter])
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id })
      const forecastData = await forecast.processForecastForBeaches(beaches)

      res.status(200).send(forecastData)
    } catch (error: any) {
      logger.error(error)
      if (error.status !== 429) {
        this.sendErrorResponse(res, {
          code: 500,
          message: 'Something went wrong!'
        })
      }
    }
  }
}
