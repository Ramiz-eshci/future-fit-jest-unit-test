module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  setupFiles: ['<rootDir>/test/setup.js'],
  collectCoverageFrom: [
    'config/**/*.js',
    'container/**/*.js',
    'controllers/**/*.js',
    'implementations/**/*.js',
    'models/**/*.js',
    '!models/_org_common.sqlserver.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
};