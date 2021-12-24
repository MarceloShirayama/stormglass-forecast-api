import './util/module-alias'
import { Server } from '@overnightjs/core'
import * as database from '@src/database'
import { ForecastController } from '@src/controller/forecast'
import express, { Application } from 'express'
import { BeachesController } from '@src/controller/beaches'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super()
  }

  public async init(): Promise<void> {
    this.setupExpress()
    this.setupControllers()
    await this.databaseSetup()
  }

  private setupExpress(): void {
    this.app.use(express.json())
    this.setupControllers()
  }

  private setupControllers(): void {
    const forecastController = new ForecastController()
    const beachesController = new BeachesController()
    this.addControllers([forecastController, beachesController])
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
