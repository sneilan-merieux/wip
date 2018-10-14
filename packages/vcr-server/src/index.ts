import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import getConfig from './getConfig';

nunjucks.configure(path.resolve(__dirname, '..'));

const config = getConfig();

export default app => {
  app.get('/vcr', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(
      nunjucks.render('vcr.html', {
        config,
      })
    );
  });

  app.get('/__vcr_client.bundle.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    fs.createReadStream(require.resolve('vcr-client/dist/client.bundle.js')).pipe(res);
  });

  app.get('/__vcr_sw.bundle.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    fs.createReadStream(require.resolve('vcr-client/dist/sw.bundle.js')).pipe(res);
  });
};
