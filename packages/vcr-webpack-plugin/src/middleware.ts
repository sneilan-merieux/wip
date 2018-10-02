const fs = require('fs');
const { join } = require('path');

module.exports = app => {
  app.get('/vcr', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');

    fs.createReadStream(join(__dirname, '../vcr.html')).pipe(res);
  });
};
