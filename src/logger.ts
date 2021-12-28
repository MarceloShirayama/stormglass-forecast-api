import pino from 'pino'
import { loggerConfig } from './envConfig'

export default pino(loggerConfig)
