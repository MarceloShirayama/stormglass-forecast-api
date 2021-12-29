import './util/module-alias'
import { Server } from '@overnightjs/core'
import * as database from '@src/database'
import { ForecastController } from '@src/controller/forecast'
import express, { Application } from 'express'
import expressPino from 'express-pino-logger'
import cors from 'cors'
import { BeachesController } from '@src/controller/beaches'
import { UsersController } from './controller/users'
import { appConfig } from './envConfig'
import logger from './logger'

export class SetupServer extends Server {
  constructor(
    private port = appConfig.port,
    private host = appConfig.host,
    private env = appConfig.env
  ) {
    super()
  }

  public async init(): Promise<void> {
    this.setupExpress()
    this.setupControllers()
    await this.databaseSetup()
  }

  private setupExpress(): void {
    this.app.use(express.json())
    this.app.use(expressPino({ logger }))
    this.app.use(cors({ origin: '*' }))
  }

  private setupControllers(): void {
    const forecastController = new ForecastController()
    const beachesController = new BeachesController()
    const usersController = new UsersController()
    this.addControllers([
      forecastController,
      beachesController,
      usersController
    ])
  }

  private async databaseSetup(): Promise<void> {
    await database.connect()
  }

  public async close(): Promise<void> {
    await database.disconnect()
  }

  public getApp(): Application {
    return this.app
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Environment: ${this.env}`)
      logger.info(`Server listening on http://${this.host}:${this.port}`)
    })
  }
}
