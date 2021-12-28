import * as http from 'http'
import { DecodeUser } from '@src/services/auth'

declare module 'express-serve-static-core' {
  // eslint-disable-next-line no-undef
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: DecodeUser
  }
}
