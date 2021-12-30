import logger from '@src/logger'
import { CUSTOM_VALIDATION } from '@src/models/user'
import ApiError, { APIError } from '@src/util/errors/api-error'
import { Response } from 'express'
import mongoose from 'mongoose'

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: mongoose.Error | Error
  ): void {
    logger.error(error)
    if (error instanceof mongoose.Error.ValidationError) {
      const clientsErrors = this.handleClientErrors(error)
      res.status(clientsErrors.code).send(
        ApiError.formatError({
          code: clientsErrors.code,
          message: clientsErrors.error
        })
      )
    } else {
      res
        .status(500)
        .send(
          ApiError.formatError({ code: 500, message: 'Something went wrong!' })
        )
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number
    error: string
  } {
    const duplicateError = Object.values(error.errors).filter(
      (error: any) => error.kind === CUSTOM_VALIDATION.DUPLICATED
    )
    if (duplicateError.length) {
      return { code: 409, error: error.message }
    }
    return { code: 400, error: error.message }
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.formatError(apiError))
  }
}
