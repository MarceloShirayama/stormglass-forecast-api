import { Controller, Post } from '@overnightjs/core'
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
}
