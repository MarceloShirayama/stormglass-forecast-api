import configRoot from './jest.config'

// eslint-disable-next-line no-import-assign
export default {
  ...configRoot,
  displayName: 'end2end-tests',
  // setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.ts']
}
