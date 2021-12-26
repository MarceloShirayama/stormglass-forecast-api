import { CUSTOM_VALIDATION } from '@src/models/user'
import { Response } from 'express'
import mongoose from 'mongoose'

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: mongoose.Error | Error
  ): Response {
    if (error instanceof mongoose.Error.ValidationError) {
      const duplicateError = Object.values(error.errors).filter(
        (error: any) => error.kind === CUSTOM_VALIDATION.DUPLICATED
      )
      console.log(Object.values(error.errors))

      if (duplicateError.length) {
        return res.status(409).send({
          code: 409,
          error: error.message
        })
      }
      return res.status(422).send({ code: 422, error: error.message })
    } else {
      return res.status(500).send({ code: 500, error: 'Something went wrong!' })
    }
  }
}
