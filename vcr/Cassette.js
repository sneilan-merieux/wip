export default class Cassette {
  DOMEvents = [];
  HTTPInteractions = [];

  addDOMEvent(event) {
    this.DOMEvents.push(event);
  }

  addHTTPInteraction(HTTPInteraction) {
    this.HTTPInteractions.push(HTTPInteraction);
  }

  dump() {
    return {
      DOMEvents: this.DOMEvents,
      HTTPInteractive: this.HTTPInteractions,
    }
  }
}
