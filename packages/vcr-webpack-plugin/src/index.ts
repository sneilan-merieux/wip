const { resolve } = require('path');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

export default class VcrWebpackPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap('VcrWebpackPlugin', _context => {
      new SingleEntryPlugin(compiler.context, resolve(__dirname, './client.js'), 'vcr.client').apply(compiler);
      new SingleEntryPlugin(compiler.context, resolve(__dirname, './sw.js'), 'vcr.sw').apply(compiler);
    });
  }
}
