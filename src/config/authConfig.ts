import * as dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.AUTH_SECRET_KEY as string
const tokenExpiresIn = process.env.TOKEN_EXPIRES_IN

export default {
  secretKey,
  tokenExpiresIn
}
