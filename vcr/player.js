const debug = require('debug')('vcr:player');
const puppeteer = require('puppeteer');

const cassetteFile = process.argv[2];
const cassette = require(cassetteFile);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    const record = cassette.HTTPInteractive.find(
      i => i.method === request.method() && i.url === request.url(),
    );
    if (record) {
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
      debug('LOG: %s', msg.args()[i]);
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
  });
  await page.waitFor(1000);
  debug('Snapshot: /tmp/example.png');
  await page.screenshot({ path: '/tmp/example.png' });

  await browser.close();
})();
