module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.unit.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/scripts/**'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 5000
};