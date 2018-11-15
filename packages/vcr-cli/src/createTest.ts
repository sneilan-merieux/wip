const USKeyboardLayout = require('puppeteer/lib/USKeyboardLayout');
const debug = require('debug')('vcr:player');
const { values } = require('lodash');
const fs = require('fs');
const getConfig = require('vcr-config').default;

declare var document;
declare var page;
declare var jest;
declare var expect;
declare var it;
declare var beforeAll;

function createTest(cassette) {
  return () => {
    function handleClick(event) {
      return page.click(event.selector);
    }

    function handleDbClick(event) {
      return page.click(event.selector, { clickCount: 2 });
    }

    function handleKeydown(event) {
      const key = values(USKeyboardLayout).find(k => k.keyCode === event.keyCode);
      debug('Press key %s', key.code);
      return page.keyboard.press(key.code);
    }

    function handleChange(event) {
      if (event.tagName === 'SELECT') {
        return page.select(event.selector, event.value);
      }
      return Promise.resolve();
    }

    async function handleSnapshot(event) {
      const watchHtml = page.waitForFunction(
        event => document.querySelector(event.selector).outerHTML === event.snapshot,
        {
          timeout: 5000,
        },
        event,
      );
      try {
        await watchHtml;
      } catch (e) {}

      const documentHandle = await page.evaluateHandle('document');
      const html = await page.evaluate(
        (document, event) => {
          console.log(event);
          return document.querySelector(event.selector).outerHTML;
        },
        documentHandle,
        event,
      );
      expect(html).toBe(event.snapshot);
    }

    jest.setTimeout(30 * 60 * 1000);

    let config;

    beforeAll(async () => {
      config = await getConfig();
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
      debug('Set viewport %j', cassette.viewport);
      await page.setViewport(cassette.viewport);
      debug('Set userAgent %s', cassette.userAgent);
      await page.setUserAgent(cassette.userAgent);
      debug('Set language %s', cassette.language);
      await page.evaluateOnNewDocument(`
        Object.defineProperty(navigator, 'language', {
          get: function() {
            return '${cassette.language}';
          }
        });
      `);
    });

    it(`Goto page ${cassette.pagePath}`, async () => {
      const pageUrl = 'http://127.0.0.1:' + config.server.port + cassette.pagePath;
      await page.goto(pageUrl);
    });
    for (let i = 0; i < cassette.events.length; i++) {
      const event = cassette.events[i];
      it(`${event.action} on ${event.selector}`, async () => {
        await page.screenshot({ path: `/tmp/vcr-${i}.png` });
        await page.waitForSelector(event.selector, { timeout: 5000 });
        const activeTag = await page.evaluate('document.activeElement.tagName');
        debug('Active element %s', activeTag);
        switch (event.action) {
          case 'click':
            await handleClick(event);
            break;
          case 'dbclick':
            await handleDbClick(event);
            break;
          case 'keydown':
            await handleKeydown(event);
            break;
          case 'change':
            await handleChange(event);
            break;
          case 'snapshot':
            await handleSnapshot(event);
          default:
            break;
        }
      });
    }
  };
}

module.exports = createTest;
