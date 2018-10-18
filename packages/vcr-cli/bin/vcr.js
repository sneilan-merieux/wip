#!/usr/bin/env node

const config = require('../lib/config').default;

process.env.JEST_PUPPETEER_CONFIG = 'vcr.config.js';

require('jest-cli/build/cli').run([
  '--config',
  JSON.stringify(config),
  '--no-cache',
  '--detectOpenHandles'
]);
