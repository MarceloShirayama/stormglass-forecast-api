import databaseConfig from '@src/config/databaseConfig'
import mongoose from 'mongoose'

const host = databaseConfig.host
const port = databaseConfig.port
const db = databaseConfig.db
const user = databaseConfig.user
const pass = databaseConfig.pass

const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}`

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
    console.info('Database is connected')
  } catch (err) {
    console.info(err)
  }

  mongoose.connection.on('error', (err) => console.error(err))
}

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect()
  console.info('Database is disconnected')
}
