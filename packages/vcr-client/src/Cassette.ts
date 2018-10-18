export interface DOMEvent {
  selector: string;
  value: string;
  tagName: string;
  action: string;
  keyCode: number;
  href: string;
  coordinates: {
    x: number,
    y: number,
  }
}

interface Viewport {
  width: number;
  height: number;
}

export default class Cassette {
  DOMEvents = [];
  HTTPInteractions = [];
  HTMLSnapshot = '';
  pageURL = '';
  viewport: Viewport;

  setViewport(viewport) {
    this.viewport = viewport;
  }

  addDOMEvent(event) {
    this.DOMEvents.push(event);
  }

  addHTTPInteraction(HTTPInteraction) {
    this.HTTPInteractions.push(HTTPInteraction);
  }

  dump() {
    return {
      pageURL: this.pageURL,
      viewport: this.viewport,
      DOMEvents: this.DOMEvents,
      HTTPInteractions: this.HTTPInteractions,
      HTMLSnapshot: this.HTMLSnapshot,
    }
  }
}
