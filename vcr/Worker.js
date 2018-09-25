import Debug from 'debug';

const debug = Debug('vcr:worker');

export default class VcrWorker {
  recording = false;

  constructor() {
    self.addEventListener('message', this.handleMessage);
    self.addEventListener('fetch', this.handleFetch);
  }

  init(event) {
    this.port = event.ports[0];
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
        if (this.recording && request.url === 'https://randomuser.me/api/') {
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
