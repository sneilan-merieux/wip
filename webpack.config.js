const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VcrWebpackPlugin = require('./vcr');

module.exports = {
  entry: {
    main: './src/index.js',
    'vcr.client': './vcr/client.js',
    'vcr.sw': './vcr/sw.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', {
              exclude: ['transform-regenerator'],
            }], '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      chunks: ['main'],
    }),
    new VcrWebpackPlugin()
  ],
  devServer: {
    before(app) {
      app.get('/vcr/*', (req, res) => {
        res.setHeader('Content-Type', 'text/html');

        fs.createReadStream(
          path.join(__dirname, 'vcr', 'vcr.html')
        ).pipe(res);
      });
    }
  }
}
