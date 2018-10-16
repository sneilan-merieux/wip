import * as path from 'path';

export default {
  globalSetup: path.resolve(__dirname, './environment/setup'),
  globalTeardown: path.resolve(__dirname, './environment/teardown'),
  testEnvironment: require.resolve('jest-environment-puppeteer'),
  setupTestFrameworkScriptFile: require.resolve('expect-puppeteer'),
  testRegex: 'tests/cassettes/.*\\.vc$',
  transform: {
    '^.+\\.vc$': 'vcr-cli/lib/transformer.js',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'vc'],
};
