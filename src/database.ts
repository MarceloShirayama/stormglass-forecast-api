import { appConfig, databaseConfig } from '@src/envConfig'
import mongoose from 'mongoose'
import logger from './logger'

const host = databaseConfig.host
const port = databaseConfig.port
const db = databaseConfig.db
const user = databaseConfig.user
const pass = databaseConfig.pass

logger.info(appConfig.env)

const uri =
  appConfig.env === 'prod'
    ? `mongodb+srv://${user}:${pass}@cluster0.gsoia.mongodb.net/${db}?retryWrites=true&w=majority`
    : `mongodb://${user}:${pass}@${host}:${port}/${db}`
logger.info(uri)

const options = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
}

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, options)
    logger.info(`Database ${db} is connected`)
  } catch (error: any) {
    logger.error(error.message)
  }

  mongoose.connection.on('error', (error) => logger.error(error.message))
}

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info(`Database ${db} is disconnected`)
}
