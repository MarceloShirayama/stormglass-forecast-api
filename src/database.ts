import config, { IConfig } from 'config'
import mongoose from 'mongoose'

const dbConfig: IConfig = config.get('App.database')

const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASSWORD

const uri = dbConfig.get('mongoUrl') as string

const options = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  user,
  pass
}

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, options)
    console.log('Database is connected')
  } catch (err) {
    console.log(err)
  }

  mongoose.connection.on('error', (err) => console.error(err))
}

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect()
  console.log('Database is disconnected')
}
