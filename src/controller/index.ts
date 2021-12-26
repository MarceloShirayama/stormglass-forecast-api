import { CUSTOM_VALIDATION } from '@src/models/user'
import { Response } from 'express'
import mongoose from 'mongoose'

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: mongoose.Error | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientsErrors = this.handleClientErrors(error)
      res.status(clientsErrors.code).send(clientsErrors)
    } else {
      res.status(500).send({ code: 500, error: 'Something went wrong!' })
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
    return { code: 422, error: error.message }
  }
}
