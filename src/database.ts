import { databaseConfig } from '@src/envConfig'
import mongoose from 'mongoose'
import logger from './logger'

const options = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
}

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(databaseConfig.mongoDbUrl, options)
    logger.info(`Database ${databaseConfig.db} is connected`)
  } catch (error: any) {
    logger.error(error.message)
  }

  mongoose.connection.on('error', (error) => logger.error(error.message))
}

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info(`Database ${databaseConfig.db} is disconnected`)
}
