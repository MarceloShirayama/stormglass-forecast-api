import './util/module-alias'
import { Server } from '@overnightjs/core'
import * as database from '@src/database'
import { ForecastController } from './controller/forecast'
import { Application } from 'express'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super(true)
  }

  public async init(): Promise<void> {
    await this.databaseSetup()
    this.setupExpress()
    this.setupControllers()
  }

  private setupExpress(): void {}

  private setupControllers(): void {
    const forecastController = new ForecastController()
    this.addControllers([forecastController])
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
}
