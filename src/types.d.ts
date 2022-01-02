import * as http from 'http'

declare module 'express-serve-static-core' {
  // eslint-disable-next-line no-undef
  export interface Request extends http.IncomingMessage, Express.Request {
    context?: {
      userId?: string
    }
  }
}
