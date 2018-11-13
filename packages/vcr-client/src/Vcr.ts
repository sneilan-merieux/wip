import * as React from 'react';
import * as ReactDOM from 'react-dom';
import finder from '@medv/finder';
import * as swivel from 'swivel';
import Debug from 'debug';
import eventsToRecord from './eventsToRecord';
import Cassette from './Cassette';
import Toolbar from './Toolbar';

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
  iframe: HTMLIFrameElement;
  previousEvent: Event;
  channel: any;

  constructor() {
    this.loadIframe();
    this.renderToolbar();
  }

  renderToolbar() {
    ReactDOM.render(React.createElement(Toolbar, { vcr: this }), document.getElementById('vcr'));
  }

  async record() {
    const events = Object.keys(eventsToRecord).map(key => eventsToRecord[key]);
    this.channel.emit('data', { action: 'start', config: window.__vcr_config__ });
    await this.reloadIframe();
    this.addAllListeners(events);
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    debug('Set current page path %j', this.iframe.contentWindow.location.pathname);
    this.cassette.pagePath = this.iframe.contentWindow.location.pathname;
    debug('Set viewport %j', viewport);
    this.cassette.viewport = viewport;
    debug('Set userAgent %s', window.navigator.userAgent);
    this.cassette.userAgent = window.navigator.userAgent;
    debug('Set language %s', window.navigator.language);
    this.cassette.language = window.navigator.language;
  }

  loadIframe() {
    this.iframe = document.getElementById('iframe') as HTMLIFrameElement;
    return new Promise(resolve => {
      this.iframe.src = window.location.href
        .split('/')
        .filter((_, i) => i !== 3)
        .join('/');
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
    this.channel.emit('data', { action: 'stop' });
  }

  install() {
    return navigator.serviceWorker
      .register('/__vcr_sw.bundle.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        this.channel = swivel.at(navigator.serviceWorker.controller);
        this.channel.on('data', this.handleMessage);
      });
  }

  handleMessage = (context, data) => {
    debug('Received message %o', data);
    const { action } = data;
    if (action) {
      this[action](data);
    }
  };

  addAllListeners(events) {
    const boundedRecordEvent = this.recordDOMEvent.bind(this);
    events.forEach(type => {
      this.iframe.contentWindow.addEventListener(type, boundedRecordEvent, true);
    });
  }

  recordHTTPInteraction(data) {
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
  }

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
