// jest.e2e.config.js
module.exports = {
    displayName: 'e2e',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/e2e.test.js'],
    verbose: true,
    // allow longer network calls
    testTimeout: 300000,
  };
  