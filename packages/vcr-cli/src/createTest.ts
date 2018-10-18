const USKeyboardLayout = require('puppeteer/lib/USKeyboardLayout');
const debug = require('debug')('vcr:player');
const { values } = require('lodash');

declare var document;
declare var page;
declare var jest;
declare var expect;

function createTest(cassette) {
  return async () => {
    jest.setTimeout(30 * 60 * 1000);
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
    for (let i = 0; i < cassette.DOMEvents.length; i++) {
      const event = cassette.DOMEvents[i];
      debug('%s on %s', event.action, event.selector);
      await page.screenshot({ path: `/tmp/vcr-${i}.png` });
      await page.waitForSelector(event.selector, { timeout: 3000 });
      const activeTag = await page.evaluate('document.activeElement.tagName');
      debug('Active element %s', activeTag);
      switch (event.action) {
        case 'click':
          await page.click(event.selector);
          break;
        case 'dbclick':
          await page.click(event.selector, { clickCount: 2 });
          break;
        case 'keydown':
          const key = values(USKeyboardLayout).find(k => k.keyCode === event.keyCode);
          debug('Press key %s', key.code);
          await page.keyboard.press(key.code);
          break;
        default:
          break;
      }
    }

    const watchHtml = page.waitForFunction(snapshot => document.documentElement.outerHTML === snapshot, {
      timeout: 3000
    }, cassette.HTMLSnapshot);
    try {
      await watchHtml;
    } catch(e) {}

    const documentHandle = await page.evaluateHandle('document');
    const html = await page.evaluate(document => document.documentElement.outerHTML, documentHandle);
    expect(cassette.HTMLSnapshot).toBe(html);
  }
}

module.exports = createTest;
