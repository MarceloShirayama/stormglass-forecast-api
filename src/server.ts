import './util/module-alias'
import { Server } from '@overnightjs/core'
import * as database from '@src/database'
import { ForecastController } from '@src/controller/forecast'
import express, { Application } from 'express'
import expressPino from 'express-pino-logger'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import * as OpenApiValidator from 'express-openapi-validator'
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types'
import apiSchema from '@src/../api.schema.json'
import { BeachesController } from '@src/controller/beaches'
import { UsersController } from './controller/users'
import { appConfig } from './envConfig'
import logger from './logger'
import { apiErrorValidator } from './middlewares/api-error-validator'

export class SetupServer extends Server {
  constructor(private port = appConfig.port, private env = appConfig.env) {
    super()
  }

  public async init(): Promise<void> {
    this.setupExpress()
    this.docSetup()
    this.setupControllers()
    await this.databaseSetup()
    this.setErrorHandlers()
  }

  private setupExpress(): void {
    this.app.use(express.json())
    this.app.use(expressPino({ logger }))
    this.app.use(cors({ origin: '*' }))
  }

  private setErrorHandlers(): void {
    this.app.use(apiErrorValidator)
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

  private docSetup(): void {
    const pathDocs = 'api-docs'
    const urlApp = `http://${appConfig.host}:${appConfig.port}`
    apiSchema.servers[0].url = urlApp
    const urlDocs = `${urlApp}/${pathDocs}`
    logger.info(`API docs: ${urlDocs}`)
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSchema))
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiSchema as OpenAPIV3.Document,
        validateRequests: true,
        validateResponses: true
      })
    )
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
      logger.info(`Server listening on port ${this.port}`)
    })
  }
}
