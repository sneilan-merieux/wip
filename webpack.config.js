const HtmlWebpackPlugin = require('html-webpack-plugin')
const VcrWebpackPlugin = require('./vcr');

module.exports = {
  entry: {
    main: [
      './vcr/client.js',
      './src/index.js',
    ],
    sw: './vcr/sw.js',
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
    }),
    new VcrWebpackPlugin()
  ]
}
