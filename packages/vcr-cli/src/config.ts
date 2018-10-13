export default {
  globalSetup: require.resolve('jest-environment-puppeteer/setup'),
  globalTeardown: require.resolve('jest-environment-puppeteer/teardown'),
  testEnvironment: require.resolve('jest-environment-puppeteer'),
  setupTestFrameworkScriptFile: require.resolve('expect-puppeteer'),
  testRegex: 'tests/cassettes/.*\\.cs$',
  transform: {
    '^.+\\.cs$': 'vcr-cli/lib/transformer.js',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'cs'],
};
