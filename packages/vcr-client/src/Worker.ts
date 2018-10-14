import Debug from 'debug';
import * as mm from 'micromatch';

declare var self: ServiceWorkerGlobalScope;

const debug = Debug('vcr:worker');

export default class VcrWorker {
  recording = false;
  port: MessagePort;
  config: any;

  constructor() {
    self.addEventListener('message', this.handleMessage);
    self.addEventListener('fetch', this.handleFetch);
  }

  init(event) {
    const { config } = event.data;
    this.port = event.ports[0];
    this.config = config;
  }

  start() {
    this.recording = true;
  }

  stop() {
    this.recording = false;
  }

  handleFetch = event => {
    const { request } = event;

    event.respondWith(
      fetch(request).then(async (response) => {
        if (this.recording && mm.any(request.url, this.config.apiMatch)) {
          const json = await response.json();
          this.message({
            action: 'recordHTTPInteraction',
            data: {
              method: request.method,
              url: response.url,
              response: json,
            }
          });
          return new Response(JSON.stringify(json), {
            headers: response.headers
          });
        }
        return response;
      }),
    );
  };

  handleMessage = event => {
    debug('Receiveed messahe %o', event);
    const { action } = event.data;
    if (action) {
      this[action](event);
    }
  }

  message(msg) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(msg);
      })
    })
  }
}
