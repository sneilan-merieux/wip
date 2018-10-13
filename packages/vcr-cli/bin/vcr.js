#!/usr/bin/env node

const config = require('../lib/config').default;

require('jest-cli/build/cli').run([
  '--config',
  JSON.stringify(config)
]);
