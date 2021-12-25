import { Controller, Post } from '@overnightjs/core'
import { User } from '@src/models/user'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

@Controller('users')
export class UsersController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body)

      const result = await user.save()

      res.status(201).send(result)
    } catch (error: any) {
      if (
        error instanceof mongoose.Error.ValidationError &&
        error.message ===
          'User validation failed: password: Email must be at least 5 characters'
      ) {
        res.status(400).send({ error: error.message })
      } else if (
        error instanceof mongoose.Error.ValidationError &&
        error.message ===
          'User validation failed: password: Email must be less than 18 characters'
      ) {
        res.status(400).send({ error: error.message })
      } else if (error instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: error.message })
      } else {
        res.status(500).send({ error: 'Internal Server Error' })
      }
    }
  }
}
