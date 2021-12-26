import { Controller, Post } from '@overnightjs/core'
import { User } from '@src/models/user'
import AuthService from '@src/services/auth'
import { Request, Response } from 'express'
import { BaseController } from '.'

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body

      if (password) {
        const hash = await AuthService.hashPassword(password)

        const user = new User({ name, email, password: hash })

        const result = await user.save()

        res.status(201).send(result)
      } else {
        res.status(403).send({ code: 403, error: 'Password is required' })
      }
    } catch (error: any) {
      this.sendCreatedUpdateErrorResponse(res, error)
    }
  }
}
