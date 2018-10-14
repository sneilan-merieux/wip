'use strict';
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'client.bundle': './src/index',
    'sw.bundle': './src/sw',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
