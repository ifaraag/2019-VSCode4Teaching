module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./test/unitSuite'],
  testResultsProcessor: 'jest-sonar-reporter'
};