import logger from '@src/logger'
import AuthService from '@src/services/auth'
import { NextFunction, Request, Response } from 'express'

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void | Response {
  try {
    const token = req.headers?.['x-access-token']
    const claims = AuthService.decodeToken(token as string)
    req.context = { userId: claims.sub }
  } catch (error: any) {
    logger.error(error.message)
    return res.status?.(401).send({
      code: 401,
      error: 'jwt malformed or no provided'
    })
  }
  next()
}
