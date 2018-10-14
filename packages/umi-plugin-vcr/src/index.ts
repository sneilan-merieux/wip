import serve from 'vcr-server';

export default (api) => {
  api._beforeServerWithApp(function ({ app }) {
    serve(app);
  });
}
