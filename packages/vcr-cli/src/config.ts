export default {
  testRegex: 'tests/cassettes/.*\\.cs$',
  transform: {
    '^.+\\.cs$': 'vcr-cli/lib/transformer.js',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'cs'],
};
