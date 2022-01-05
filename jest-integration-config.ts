import configRoot from './jest.config'

// eslint-disable-next-line no-import-assign
export default {
  ...configRoot,
  displayName: 'end2end-tests',
  testMatch: ['<rootDir>/test/**/*.test.ts']
}
