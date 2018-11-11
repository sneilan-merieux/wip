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
  events = [];
  HTTPInteractions = [];
  pagePath = '';

  addEvent(event) {
    this.events.push(event);
  }

  addHTTPInteraction(HTTPInteraction) {
    this.HTTPInteractions.push(HTTPInteraction);
  }

  dump() {
    return {
      pagePath: this.pagePath,
      viewport: this.viewport,
      userAgent: this.userAgent,
      language: this.language,
      events: this.events,
      HTTPInteractions: this.HTTPInteractions,
    }
  }
}
