import { resolve } from 'path'
import rootConfig from '../jest.config'

const root = resolve(__dirname, '..')

export default {
  ...rootConfig,
  ...{
    rootDir: root,
    displayName: 'end2end-tests',
    setupFilesAfterEnv: ['<rootDir>/test/jest-setup.ts'],
    testMatch: ['<rootDir>/test/**/*.test.ts']
  }
}
