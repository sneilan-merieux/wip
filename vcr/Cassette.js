export default class Cassette {
  DOMEvents = [];
  HTTPInteractions = [];
  HTMLSnapshot = '';

  addDOMEvent(event) {
    this.DOMEvents.push(event);
  }

  addHTTPInteraction(HTTPInteraction) {
    this.HTTPInteractions.push(HTTPInteraction);
  }

  setHTMLSnapshot(snapshot) {
    this.HTMLSnapshot = snapshot;
  }

  dump() {
    return {
      DOMEvents: this.DOMEvents,
      HTTPInteractive: this.HTTPInteractions,
      HTMLSnapshot: this.HTMLSnapshot,
    }
  }
}
