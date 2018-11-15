import { basename } from 'path';

export function process(src, path) {
  const name = basename(path, '.vc');
  return `
    const createTest = require('vcr-cli/lib/createTest');
    describe('${name}', createTest(${src}));
  `;
}
