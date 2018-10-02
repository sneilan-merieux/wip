const debug = require('debug')('vcr:player');
const puppeteer = require('puppeteer');
const assert = require('assert');

const cassetteFile = process.argv[2];
const cassette = require(cassetteFile);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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
          'access-control-allow-origin': '*'
        },
        body: JSON.stringify(record.response),
      });
    } else {
      request.continue();
    }
  });
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      debug('PAGE LOG: %s', msg.args()[i]);
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

  debug('Snapshot: /tmp/example.png');
  await page.screenshot({ path: '/tmp/example.png' });

  const documentHandle = await page.evaluateHandle('document');
  const html = await page.evaluate(document => document.documentElement.outerHTML, documentHandle);
  try {
    assert.equal(cassette.HTMLSnapshot, html)
  } catch (e) {
    console.error(e);
  }

  await browser.close();
})();
