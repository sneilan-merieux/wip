import yargs, { showHelp } from 'yargs';
import * as globby from 'globby';
import * as path from 'path';
import { usage, options, Argv } from './args';
import Player from '../Player';

export default async () => {
  const argv = buildArgv();

  if (argv._.length === 0 && !argv.cassettePathPattern) {
    showHelp();
    process.on('exit', () => (process.exitCode = 1));
    return;
  }

  run(argv);
};

const buildArgv = (): Argv => {
  const argv: Argv = yargs(process.argv.slice(2))
    .usage(usage)
    .options(options).argv;

  return argv;
};

function buildCassettePathPatterns(argv: Argv) {
  const patterns: string[] = [];

  if (argv._) {
    patterns.push(...argv._);
  }
  if (argv.cassettePathPattern) {
    patterns.push(...argv.cassettePathPattern);
  }

  return patterns;
};

async function run(argv: Argv) {
  const cassettePathPatterns = buildCassettePathPatterns(argv);
  const files = await globby(cassettePathPatterns);
  const player = new Player();
  await player.startup();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const cassette = require(path.resolve(process.cwd(), file));
    try {
      await player.play(cassette);
    } catch(e) {
      console.log(e);
    }
  }
  await player.stop();
}
