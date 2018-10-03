import { Options, Arguments } from 'yargs';

export interface Argv extends Arguments {
  cassettePathPattern?: string[];
}

export const usage = 'Usage: $0 [cassettePathPattern]';

export const options: { [name: string]: Options } = {
  cassettePathPattern: {
    description: 'A regexp pattern string that is matched against all cassettes ' + 'paths before executing the test.',
    type: 'array',
  },
};
