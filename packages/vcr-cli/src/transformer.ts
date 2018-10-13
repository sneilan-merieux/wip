import { basename } from 'path';

export function process(src, path, config, transformOptions) {
  return `
  const puppeteer = require('puppeteer');
  const debug = require('debug')('vcr:player');
  const cassette = ${src};

  test('replay ${basename(path, '.vc')}', async () => {
    await page.setRequestInterception(true);
    page.on('request', request => {
      const recordIndex = cassette.HTTPInteractions.findIndex(
        i => i.method === request.method() && i.url === request.url(),
      );
      if (recordIndex !== -1) {
        const record = cassette.HTTPInteractions[recordIndex];
        cassette.HTTPInteractions.splice(recordIndex, 1);
        debug('Match request %s %s', record.method, record.url);
        request.respond({
          status: 200,
          contentType: 'application/json; charset=utf-8',
          headers: {
            'access-control-allow-origin': '*',
          },
          body: JSON.stringify(record.response),
        });
      } else {
        request.continue();
      }
    });
    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i) debug('PAGE LOG: %s', msg.args()[i]);
    });
    debug('Goto page %s', cassette.pageURL);
    await page.goto(cassette.pageURL);
    cassette.DOMEvents.forEach(async event => {
      debug('%s on %s', event.action, event.selector);
      await page.waitForSelector(event.selector, { timeout: 3000 });
      switch (event.action) {
        case 'click':
          await page.click(event.selector);
          break;
        case 'dbclick':
          await page.click(event.selector, { clickCount: 2 });
          break;
        default:
          break;
      }
      await page.waitFor(1000);
    });

    await page.waitFor(1000);

    const watchHtml = page.waitForFunction(snapshot => document.documentElement.outerHTML === snapshot, {
      timeout: 3000
    }, cassette.HTMLSnapshot);
    try {
      await watchHtml;
    } catch(e) {}

    const documentHandle = await page.evaluateHandle('document');
    const html = await page.evaluate(document => document.documentElement.outerHTML, documentHandle);
    expect(cassette.HTMLSnapshot).toBe(html);
  });
`;
}
