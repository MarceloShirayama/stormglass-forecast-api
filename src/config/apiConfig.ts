import * as dotenv from 'dotenv'

dotenv.config()

const apiToken = (
  process.env.NODE_ENV === 'test' ? 'test' : process.env.STORM_GLASS_API_KEY
) as string

export default {
  resources: {
    apiUrl: process.env.STORMGLASS_API_URL as string,
    apiToken
  }
}
