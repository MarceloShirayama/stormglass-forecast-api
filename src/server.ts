import './util/module-alias'
import { Server } from '@overnightjs/core'
import { ForecastController } from './controller/forecast'
import { Application } from 'express'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super(true)
  }

  public init(): void {
    this.setupExpress()
    this.setupControllers()
  }

  private setupExpress(): void {}

  private setupControllers(): void {
    const forecastController = new ForecastController()
    this.addControllers([forecastController])
  }

  public getApp(): Application {
    return this.app
  }
}
