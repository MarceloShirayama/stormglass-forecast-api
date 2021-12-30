import ApiError from '@src/util/errors/api-error'
import { Request, Response, NextFunction } from 'express'

interface HTTPError extends Error {
  status?: number
}

export function apiErrorValidator(
  error: HTTPError,
  _req: Partial<Request>,
  res: Response,
  _next: NextFunction
): void {
  const errorCode = error.status || 500
  res
    .status(errorCode)
    .send(ApiError.formatError({ code: errorCode, message: error.message }))
}
