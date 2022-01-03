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
  host: process.env.APP_HOST_LOCAL,
  port: process.env.PORT ? process.env.PORT : process.env.APP_PORT_LOCAL
}

export const apiConfig = {
  resources: {
    apiUrl: process.env.STORMGLASS_API_URL as string,
    apiToken: (process.env.NODE_ENV === environment.test
      ? 'test_token'
      : process.env.STORM_GLASS_API_KEY) as string,
    endTimestampInDays: Number(
      process.env.STORM_GLASS_API_END_TIMESTAMP_IN_DAYS
    )
  },
  requestLimit: {
    windowMs:
      (Number(process.env.FORECAST_REQUEST_WINDOW_HOUR) * 1000 * 60 * 60) |
      (1 * 1000 * 60 * 60), // 1 hour
    requestPerHour: Number(process.env.REQUEST_LIMIT_PER_HOUR) | 10 // 10 requests per hour
  },
  cacheTTL:
    (Number(process.env.STORM_GLASS_API_CACHE_TTL) * 60 * 60) | (24 * 60 * 60) // default 24 hours
}

export const authConfig = {
  secretKey: process.env.AUTH_SECRET_KEY as string,
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN
}

export const databaseConfig = {
  db:
    appConfig.env === environment.test
      ? process.env.DATABASE_TEST
      : process.env.MONGO_DB,
  mongoDbUrl: (process.env.MONGO_MONGODB_URL
    ? process.env.MONGO_MONGODB_URL
    : process.env.MONGO_MONGODB_URL_LOCAL) as string
}

export const loggerConfig =
  appConfig.env !== environment.test
    ? { enabled: true, level: 'info' }
    : { enabled: false }
