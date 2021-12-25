import config from 'config'
import { SetupServer } from './server'
// #endregion
;(async (): Promise<void> => {
  const server = new SetupServer(config.get('App.port'))
  await server.init()
  server.start()
})().catch(console.error)
