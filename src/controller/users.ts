import { Controller, Get, Middleware, Post } from '@overnightjs/core'
import logger from '@src/logger'
import { authMiddleware } from '@src/middlewares/auth'
import { User } from '@src/models/user'
import AuthService from '@src/services/auth'
// import AuthService from '@src/services/auth'
import { Request, Response } from 'express'
import { BaseController } from '.'

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body)
      if (user.password) {
        user.password = await AuthService.hashPassword(user.password)
      }
      const result = await user.save()
      res.status(201).send(result)
    } catch (error: any) {
      this.sendCreatedUpdateErrorResponse(res, error)
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !user.email) {
      logger.error('Incorrect email')
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Incorrect email or password'
      })
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      logger.error('Incorrect password')
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Incorrect email or password'
      })
    }

    const token = AuthService.generateToken(user.toJSON())

    logger.info(`User ${user.email} authenticated`)
    return res.status(200).send({ token })
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const email = req.decoded ? req.decoded.email : undefined
    const user = await User.findOne({ email })

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found!'
      })
    }
    return res.status(200).send({ user })
  }
}
