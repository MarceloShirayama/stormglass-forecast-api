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
})
