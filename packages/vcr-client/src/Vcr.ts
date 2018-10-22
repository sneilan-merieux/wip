import finder from '@medv/finder';
import Debug from 'debug';
import eventsToRecord from './eventsToRecord';
import Cassette, { DOMEvent } from './Cassette';

const debug = Debug('vcr:client');

function getCoordinates(evt) {
  const eventsWithCoordinates = {
    mouseup: true,
    mousedown: true,
    mousemove: true,
    mouseover: true,
  };
  return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null;
}

export default class Vcr {
  cassette = new Cassette();
  channel = new MessageChannel();
  port: MessagePort;
  iframe: HTMLIFrameElement;
  serviceWorker: ServiceWorker;
  previousEvent: Event;

  constructor() {
    this.port = this.channel.port1;
    this.iframe = document.getElementById('iframe') as HTMLIFrameElement;
    this.loadIframe();
  }

  async record() {
    const events = Object.keys(eventsToRecord).map(key => eventsToRecord[key]);
    this.message({ action: 'start' });
    await this.reloadIframe();
    this.addAllListeners(events);
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    debug('Set viewport %j', viewport);
    this.cassette.setViewport(viewport);
    debug('Set userAgent %s', window.navigator.userAgent);
    this.cassette.setUserAgent(window.navigator.userAgent);
    debug('Set language %s', window.navigator.language);
    this.cassette.setUserAgent(window.navigator.language);
  }

  loadIframe() {
    return new Promise(resolve => {
      this.iframe.src = window.location.origin;
      this.cassette.pageURL = this.iframe.src;
      debug('Loading page %s', this.iframe.src);
      this.iframe.onload = resolve;
    });
  }

  reloadIframe() {
    return new Promise(resolve => {
      this.iframe.onload = resolve;
      this.iframe.contentWindow.location.reload();
    });
  }

  stop() {
    this.message({ action: 'stop' });
  }

  install() {
    return new Promise(resolve => {
      navigator.serviceWorker.register('/__vcr_sw.bundle.js').then(registration => {
        if (registration.active) {
          debug('SW active');
          this.serviceWorker = registration.active;
          navigator.serviceWorker.addEventListener('message', this.handleMessage);
          this.message({ action: 'init', config: window.__vcr_config__ });
          resolve();
        }
      });
    });
  }

  message(msg) {
    this.serviceWorker.postMessage(msg);
  }

  handleMessage = event => {
    debug('Received message %o', event);
    const { action } = event.data;
    if (action) {
      this[action](event);
    }
  };

  addAllListeners(events) {
    const boundedRecordEvent = this.recordDOMEvent.bind(this);
    events.forEach(type => {
      this.iframe.contentWindow.addEventListener(type, boundedRecordEvent, true);
    });
  }

  recordHTTPInteraction(event) {
    const { data } = event.data;
    debug('Record HTTPInteraction %o', data);
    this.cassette.addHTTPInteraction(data);
  }

  recordSnapshotEvent(e) {
    const event = {
      selector: finder(e.target, {
        root: this.iframe.contentWindow.document.documentElement,
        seedMinLength: 5,
        optimizedMinLength: 10,
      }),
      action: 'snapshot',
      snapshot: e.target.outerHTML,
    };
    debug('Record snapshot event %o', event);
    this.cassette.addEvent(event);
  };

  recordDOMEvent(e) {
    if (this.previousEvent && this.previousEvent.timeStamp === e.timeStamp) return;
    this.previousEvent = e;

    const event = {
      selector: finder(e.target, {
        root: this.iframe.contentWindow.document.documentElement,
        seedMinLength: 5,
        optimizedMinLength: 10,
      }),
      value: e.target.value,
      tagName: e.target.tagName,
      action: e.type,
      keyCode: e.keyCode ? e.keyCode : null,
      href: e.target.href ? e.target.href : null,
      coordinates: getCoordinates(e),
    };
    debug('Record dom event %o', event);
    this.cassette.addEvent(event);
  }
}
