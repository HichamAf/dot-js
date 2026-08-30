// tests/setup-dom.js
// Installs a jsdom-backed `document`/`window` as globals so framework
// modules (which target a real browser DOM) can run under Node's test
// runner. Import this once at the top of any test file that touches
// the DOM. jsdom is a test-only devDependency -- it is not a UI
// framework or library, just a DOM implementation for Node.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;

export { dom };
