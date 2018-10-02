import finder from '@medv/finder';
import Debug from 'debug';
import eventsToRecord from './eventsToRecord';
import Cassette from './Cassette';

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

  constructor(iframe) {
    this.channel = new MessageChannel();
    this.port = this.channel.port1;
    this.iframe = iframe;
  }

  async record() {
    const events = Object.values(eventsToRecord);
    this.message({ action: 'start' });
    this.addAllListeners(events);
  }

  stop() {
    this.message({ action: 'stop' });
  }

  save() {
    console.log(this.cassette.dump());
  }

  install() {
    return new Promise(resolve => {
      navigator.serviceWorker.register('/vcr.sw.js').then(registration => {
        if (registration.active) {
          debug('SW active');
          this.serviceWorker = registration.active;
          navigator.serviceWorker.addEventListener('message', this.handleMessage);
          this.message({ action: 'init' });
          resolve();
        }
      });
    })
  }

  message(msg) {
    this.serviceWorker.postMessage(msg);
  }

  handleMessage = (event) => {
    debug('Received message %o', event);
    const { action } = event.data;
    if (action) {
      this[action](event);
    }
  }

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

  recordDOMEvent(e) {
    if (this.previousEvent && this.previousEvent.timeStamp === e.timeStamp) return;
    this.previousEvent = e;

    const event = {
      selector: finder(e.target, { root: this.iframe.contentWindow.document, seedMinLength: 5, optimizedMinLength: 10 }),
      value: e.target.value,
      tagName: e.target.tagName,
      action: e.type,
      keyCode: e.keyCode ? e.keyCode : null,
      href: e.target.href ? e.target.href : null,
      coordinates: getCoordinates(e),
   };
    debug('Record DOMEvent %o', event);
    this.cassette.addDOMEvent(event);
  }
}
