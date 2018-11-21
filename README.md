# VCR

Record and replay E2E tests.

## Installation

```bash
$ npm install vcr-webpack-plugin vcr-cli --save-dev
```

## Configuration

```js
// webpack.config.js
const VcrWebpackPlugin = require('vcr-webpack-plugin');
const middleware = require('vcr-webpack-plugin/lib/middleware');

module.exports = {
  ...,
  plugins: [
    new VcrWebpackPlugin(),
  ]
  devServer: {
    before(app) {
      middleware(app);
    },
  },
}
```

## Run tests

```bash
$ vcr
```

## LICENSE

MIT
