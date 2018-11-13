import Debug from 'debug';
import * as mm from 'micromatch';
import * as swivel from 'swivel';

declare var self: ServiceWorkerGlobalScope;

const debug = Debug('vcr:worker');

export default class VcrWorker {
  recording = false;
  config: any;

  constructor() {
    self.addEventListener('fetch', this.handleFetch);
    swivel.on('data', this.handleMessage);
  }

  start(data) {
    const { config } = data;
    this.config = config;
    this.recording = true;
  }

  stop() {
    this.recording = false;
  }

  handleFetch = event => {
    const { request } = event;

    event.respondWith(
      fetch(request).then(async (response) => {
        debug('Fetch %s', request.url);
        if (this.recording && mm.any(request.url, this.config.apiMatch)) {
          const json = await response.json();
          swivel.broadcast('data', {
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

  handleMessage = (context, data) => {
    debug('Receiveed messahe %o', data);
    const { action } = data;
    if (action) {
      this[action](data);
    }
  }
}
