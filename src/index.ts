import { SetupServer } from './server'
import * as dotenv from 'dotenv'
import { appConfig } from './envConfig'
import logger from './logger'

dotenv.config()

/* eslint-disable no-unused-vars */
enum ExitStatus {
  Success = 0,
  Failure = 1
}
/* eslint-enable no-unused-vars */
process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  )
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason
})

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`)
  process.exit(ExitStatus.Failure)
})

// prettier-ignore
;(async (): Promise<void> => {
  try {
    const server = new SetupServer(appConfig.port)
    await server.init()
    server.start()

    // eslint-disable-next-line no-undef
    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']
    for (const exitSignal of exitSignals) {
      process.on(exitSignal, async () => {
        try {
          await server.close()
          logger.info(
            `Server successfully closed with ${exitSignal} exitSignal`
          )
          process.exit(ExitStatus.Success)
        } catch (error: any) {
          logger.error(`Server close error: ${error.message}`)
          process.exit(ExitStatus.Failure)
        }
      })
    }
  } catch (error: any) {
    logger.error(`App exited with error: ${error.message}`)
    process.exit(ExitStatus.Failure)
  }
})().catch(console.error)
