import * as dotenv from 'dotenv'

dotenv.config()

/* eslint-disable no-unused-vars */
enum environment {
  dev = 'development',
  test = 'test',
  prod = 'production'
  /* eslint-enable no-unused-vars */
}

export const appConfig = {
  env: process.env.NODE_ENV,
  host:
    process.env.NODE_ENV === environment.dev
      ? process.env.APP_HOST_LOCAL
      : process.env.APP_HOST_PROD,
  port:
    process.env.NODE_ENV === environment.dev
      ? Number(process.env.APP_PORT_LOCAL)
      : Number(process.env.APP_PORT_PROD)
}

const apiToken = (
  process.env.NODE_ENV === environment.test
    ? 'test_token'
    : process.env.STORM_GLASS_API_KEY
) as string

export const apiConfig = {
  resources: {
    apiUrl: process.env.STORMGLASS_API_URL as string,
    apiToken,
    endTimestampInDays: Number(
      process.env.STORM_GLASS_API_END_TIMESTAMP_IN_DAYS
    )
  },
  requestLimit: {
    windowMs: 1 * 1000 * 60 * 60,
    requestPerHour: 10
  }
}

const secretKey = process.env.AUTH_SECRET_KEY as string
const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN

export const authConfig = {
  secretKey,
  tokenExpiresIn
}

const db =
  appConfig.env === environment.test
    ? process.env.DATABASE_TEST
    : appConfig.env === environment.dev
    ? process.env.DATABASE_DEV
    : process.env.MONGO_DATABASE

export const databaseConfig = {
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
  db
}

export const loggerConfig =
  appConfig.env !== environment.test
    ? { enabled: true, level: 'info' }
    : { enabled: false }
