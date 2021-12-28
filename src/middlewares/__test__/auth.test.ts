import AuthService from '@src/services/auth'
import { authMiddleware } from '../auth'

describe('AuthMiddleware', () => {
  it('Should verify a JWT token and call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'fake-data' })
    const reqFake = {
      headers: {
        'x-access-token': jwtToken
      }
    }
    const resFake = {}
    const nextFake = jest.fn()

    authMiddleware(reqFake, resFake, nextFake)

    expect(nextFake).toHaveBeenCalled()
  })

  it('Should return unauthorized if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid-token'
      }
    }
    const sendMock = jest.fn()
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock
      }))
    }
    const nextFake = jest.fn()

    authMiddleware(reqFake, resFake as object, nextFake)

    expect(resFake.status).toHaveBeenCalledWith(401)
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed or no provided'
    })
  })

  it('Should return unauthorized if token not provided', () => {
    const reqFake = {
      headers: {}
    }
    const sendMock = jest.fn()
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock
      }))
    }
    const nextFake = jest.fn()

    authMiddleware(reqFake, resFake as object, nextFake)

    expect(resFake.status).toHaveBeenCalledWith(401)
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed or no provided'
    })
  })
})