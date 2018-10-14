import * as fs from 'fs';
import * as path from 'path';
import * as merge from 'merge-deep';

const defaultConfig = {
};

export default function getConfig() {
  const configPath = 'vcr.config.js';
  const absConfigPath = path.resolve(process.cwd(), configPath);
  const configExists = fs.existsSync(absConfigPath);

  if (!configExists) {
    return defaultConfig;
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const localConfig = require(absConfigPath);
  return merge({}, defaultConfig, localConfig);
}
