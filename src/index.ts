import { SetupServer } from './server'
import * as dotenv from 'dotenv'
import appConfig from './config/appConfig'

dotenv.config()
// #endregion
;(async (): Promise<void> => {
  const server = new SetupServer(appConfig.port)
  await server.init()
  server.start()
})().catch(console.error)
