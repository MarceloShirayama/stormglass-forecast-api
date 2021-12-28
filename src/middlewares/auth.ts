import AuthService from '@src/services/auth'
import { NextFunction, Request, Response } from 'express'

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void | Response {
  try {
    const token = req.headers?.['x-access-token']
    const decoded = AuthService.decodeToken(token as string)
    req.decoded = decoded
  } catch (error) {
    return res.status?.(401).send({
      code: 401,
      error: 'jwt malformed or no provided'
    })
  }
  next()
}
