import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const beach = req.body
    res.status(201).send({ ...beach, id: 'fake_id' })
  }
}
