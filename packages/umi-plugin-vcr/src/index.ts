import VcrWebpackPlugin from 'vcr-webpack-plugin';
import vcrMiddleware from 'vcr-webpack-plugin/lib/middleware';

export default (api) => {
  api.chainWebpackConfig((config) => {
    config.plugin('vcr').use(VcrWebpackPlugin);
  });

  api.addMiddlewareAhead(() => {
    return vcrMiddleware;
  });
}
