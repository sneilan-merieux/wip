const fs = require('fs');
const { join } = require('path');

export default (req, res, next) => {
  res.setHeader('Content-Type', 'text/html');
  return fs.createReadStream(join(__dirname, '../vcr.html')).pipe(res);
};
