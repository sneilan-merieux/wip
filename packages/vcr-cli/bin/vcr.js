#!/usr/bin/env node

const yParser = require('yargs-parser');
const args = yParser(process.argv.slice(2));

const config = require('../lib/config').default;

process.env.JEST_PUPPETEER_CONFIG = 'vcr.config.js';

require('jest').runCLI(
  {
    config: JSON.stringify(config),
    ...args,
  },
  [process.cwd()]
);
