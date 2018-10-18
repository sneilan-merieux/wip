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
  viewport: Viewport;
  userAgent: string;
  language: string;
  DOMEvents = [];
  HTTPInteractions = [];
  HTMLSnapshot = '';
  pageURL = '';

  setViewport(viewport) {
    this.viewport = viewport;
  }

  setUserAgent(userAgent) {
    this.userAgent = userAgent;
  }

  setLanguage(language) {
    this.language = language;
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
      userAgent: this.userAgent,
      language: this.language,
      DOMEvents: this.DOMEvents,
      HTTPInteractions: this.HTTPInteractions,
      HTMLSnapshot: this.HTMLSnapshot,
    }
  }
}
