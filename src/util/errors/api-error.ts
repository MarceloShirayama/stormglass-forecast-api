import httpStatusCodes from 'http-status-codes'

export type APIError = {
  message: string
  code: number
  codeName?: string
  description?: string
  documentation?: string
}

export type APIErrorResponse = Omit<APIError, 'codeName'> & {
  error: string
}

export default class ApiError {
  public static formatError(error: APIError): APIErrorResponse {
    return {
      ...{
        message: error.message,
        code: error.code,
        error: error.codeName
          ? error.codeName
          : httpStatusCodes.getStatusText(error.code)
      },
      ...(error.description && { description: error.description }),
      ...(error.documentation && { documentation: error.documentation })
    }
  }
}
