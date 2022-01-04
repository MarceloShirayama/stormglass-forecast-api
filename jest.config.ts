// import { resolve } from 'path'

// const root = resolve(__dirname)

export default {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  setupFiles: ['<rootDir>/src/envConfig.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1'
  },
  watchPathIgnorePatterns: ['globalConfig']
}
