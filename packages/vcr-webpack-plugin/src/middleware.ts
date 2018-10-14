const fs = require('fs');

export default app => {
  app.get('/vcr', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(require.resolve('vcr-client/vcr.html')).pipe(res);
  });

  app.get('/__vcr__/client.bundle.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    fs.createReadStream(require.resolve('vcr-client/dist/client.bundle.js')).pipe(res);
  });

  app.get('/__vcr__/sw.bundle.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    fs.createReadStream(require.resolve('vcr-client/dist/sw.bundle.js')).pipe(res);
  });
};
