import * as dotenv from 'dotenv'

dotenv.config()

export const appConfig = {
  host: process.env.APP_HOST,
  port: Number(process.env.APP_PORT),
  env: process.env.NODE_ENV
}

const apiToken = (
  process.env.NODE_ENV === 'test' ? 'test' : process.env.STORM_GLASS_API_KEY
) as string

export const apiConfig = {
  resources: {
    apiUrl: process.env.STORMGLASS_API_URL as string,
    apiToken
  }
}

const secretKey = process.env.AUTH_SECRET_KEY as string
const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN

export const authConfig = {
  secretKey,
  tokenExpiresIn
}

const db =
  appConfig.env === 'test'
    ? process.env.DATABASE_TEST
    : process.env.MONGO_DATABASE

export const databaseConfig = {
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
  db
}
