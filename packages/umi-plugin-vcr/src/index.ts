import vcrMiddleware from 'vcr-webpack-plugin/lib/middleware';

export default (api) => {
  api._beforeServerWithApp(function ({ app }) {
    vcrMiddleware(app);
  });
}
