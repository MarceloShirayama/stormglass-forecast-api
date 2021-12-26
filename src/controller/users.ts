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

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      console.log('User not found')
      return
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      console.log('Invalid password')

      return
    }

    const token = AuthService.generateToken(user.toJSON())

    res.status(200).send({ token })
  }
}
