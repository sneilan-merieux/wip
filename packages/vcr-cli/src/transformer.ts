import { basename, resolve } from 'path';
import * as nunjucks from 'nunjucks';
console.log(__dirname);

nunjucks.configure(resolve(__dirname, '../templates'));

export function process(src, path) {
 return nunjucks.render('./test.js', {
   name: basename(path, '.vc'),
   cassette: src,
 });
}
