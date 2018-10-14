const HtmlWebpackPlugin = require('html-webpack-plugin');
const VcrWebpackPlugin = require('vcr-webpack-plugin');
const vcrMiddleware = require('vcr-webpack-plugin/lib/middleware');

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  exclude: ['transform-regenerator'],
                },
              ],
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      chunks: ['main'],
    }),
    new VcrWebpackPlugin(),
  ],
  devServer: {
    before(app) {
      app.use('/vcr', vcrMiddleware);
    },
  },
};
