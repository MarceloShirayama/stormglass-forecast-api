// import { resolve } from 'path'

// const root = resolve(__dirname)

export default {
  // rootDir: root,
  displayName: 'root-tests',
  bail: true,
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  setupFiles: [
    '<rootDir>/src/config/apiConfig.ts',
    '<rootDir>/src/config/appConfig.ts',
    '<rootDir>/src/config/databaseConfig.ts',
    '<rootDir>/src/config/authConfig.ts'
  ],
  // collectCoverage: true,
  // collectCoverageFrom: ['<rootDir>/src/modules/**/useCases/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1'
  }
}
