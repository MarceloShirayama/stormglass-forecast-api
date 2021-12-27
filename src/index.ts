import { SetupServer } from './server'
import * as dotenv from 'dotenv'
import { appConfig } from './envConfig'

dotenv.config()
// #endregion
;(async (): Promise<void> => {
  const server = new SetupServer(appConfig.port)
  await server.init()
  server.start()
})().catch(console.error)
