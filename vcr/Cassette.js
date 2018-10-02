export default class Cassette {
  DOMEvents = [];
  HTTPInteractions = [];
  HTMLSnapshot = '';
  pageURL = '';

  addDOMEvent(event) {
    this.DOMEvents.push(event);
  }

  addHTTPInteraction(HTTPInteraction) {
    this.HTTPInteractions.push(HTTPInteraction);
  }

  dump() {
    return {
      pageURL: this.pageURL,
      DOMEvents: this.DOMEvents,
      HTTPInteractions: this.HTTPInteractions,
      HTMLSnapshot: this.HTMLSnapshot,
    }
  }
}
