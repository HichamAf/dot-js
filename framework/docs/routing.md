# Routing

dot-js's router controls what's on screen based on the URL (using the
History API — clean URLs like `/active`, no `#`), and lets you change the
URL programmatically without a full page reload.

## Setting up routes

```js
import { createRouter } from '/framework/index.js';

const router = createRouter([
  { path: '/', name: 'all' },
  { path: '/active', name: 'active' },
  { path: '/todos/:id', name: 'todo-detail' },
  { path: '*', name: 'not-found' }, // matches anything else
]);
```

Path segments starting with `:` are dynamic and captured as params:
`/todos/:id` matches `/todos/42` with `params = { id: '42' }`.

## Rendering based on the current route

`router.current()` returns `{ route, params }` for whatever URL is active
right now. Call it from your root component:

```js
function App() {
  const { route, params } = router.current();
  if (route.name === 'todo-detail') return h(TodoDetailPage, { id: params.id });
  if (route.name === 'active') return h(TodoPage, { filterName: 'active' });
  return h(TodoPage, { filterName: 'all' });
}
```

## Re-rendering when the URL changes

Start the router and subscribe it to your app's `rerender`, once, at
startup (mirroring how a store is wired up — see [state.md](./state.md)):

```js
const app = mount(App, {}, document.getElementById('app'));
router.subscribe(() => app.rerender());
router.start(); // begins listening for back/forward navigation
```

## Changing the URL programmatically

```js
router.navigate('/todos/42');          // pushes a new history entry
router.navigate('/login', { replace: true }); // replaces the current entry (no back-button trip)
```

Call this from anywhere — an event handler, after a successful API call, etc.

## Navigation links

Building a plain `<a href="/active">` would trigger a full page reload.
Use the `link()` helper instead — it renders a real, accessible `<a>` (so
right-click / open-in-new-tab / hover-preview all still work), but
intercepts a normal left-click to navigate via the router:

```js
import { link } from '/framework/index.js';

h('nav', {}, [
  link(router, { to: '/' }, 'All'),
  link(router, { to: '/active' }, 'Active'),
])
```

See `/example/todo-app/public/src/components/Filters.js` for a complete
example that also highlights the currently active link.
