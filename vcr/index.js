const path = require('path');

class VcrWebpackPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap('VcrWebpackPlugin', (_context, entry) => {
    });
  }
}

module.exports = VcrWebpackPlugin;
