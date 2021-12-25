import * as dotenv from 'dotenv'

dotenv.config()

export default {
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
  db: process.env.MONGO_DATABASE
}
