import * as dotenv from 'dotenv'

dotenv.config()

export default {
  host: process.env.APP_HOST,
  port: Number(process.env.APP_PORT)
}
