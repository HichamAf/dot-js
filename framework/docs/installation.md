# Installation

dot-js has zero runtime dependencies and no build step. There are two ways
to use it.

## Option 1 — copy the framework folder (simplest)

Copy this repository's `framework/src/` directory into your project (e.g. as
`vendor/dot-js/`), and import from it with a relative path:

```js
import { h, mount } from './vendor/dot-js/index.js';
```

## Option 2 — serve it alongside your app (used by the example project)

If your app is served by a small backend (Express, or any static file
server), mount the framework's `src/` folder at its own URL and import it
with an absolute path from any of your app's files:

```js
// server.js
app.use('/framework', express.static(path.join(__dirname, '../../framework/src')));
```

```js
// app.js, or any component
import { h, mount, createStore } from '/framework/index.js';
```

This is exactly what `/example/todo-app` does — see its `server/server.js`.

## Requirements

- Any modern evergreen browser (Chrome, Firefox, Safari, Edge) — dot-js uses
  standard ES modules, the History API, and `fetch()`. No polyfills needed.
- Node.js 18+ if you also want to run the framework's own test suite
  (`npm test` inside `framework/`), which uses Node's built-in test runner.

## Serve over HTTP, not `file://`

Because dot-js uses native ES modules (`import`/`export`), your HTML page
must be served over `http://` (even just `http://localhost`) — browsers
block ES module imports from `file://` URLs. Any static file server works,
e.g. `npx serve .`, Python's `python3 -m http.server`, or (as in the
example app) a small Express server.
