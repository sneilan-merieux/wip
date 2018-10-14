import VcrWebpackPlugin from 'vcr-webpack-plugin';
import vcrMiddleware from 'vcr-webpack-plugin/lib/middleware';

export default (api) => {
  api.chainWebpackConfig((memo) => {
    return memo.plugin('vcr').use(VcrWebpackPlugin);
  });

  api.addMiddlewareAhead((middlewares) => {
    middlewares.push(vcrMiddleware);
  });
}
