import { basename } from 'path';
import * as YAML from 'js-yaml';

export function process(src, path) {
  const name = basename(path, '.yml');
  const cassette = YAML.load(src);
  return `
    const createTest = require('vcr-cli/lib/createTest');
    describe('${name}', createTest(${JSON.stringify(cassette)}));
  `;
}
