import config from './jest.config'

export default {
  ...config,
  displayName: 'root-tests',
  testMatch: ['<rootDir>/src/**/*.test.ts']
}
