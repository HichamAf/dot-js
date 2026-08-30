# Getting started

This walks through building a tiny counter app from nothing, using every
core concept you'll need for a real app.

## 1. A minimal page

```html
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

## 2. Describe UI with `h()`

`h(tag, props, children)` creates a "virtual node" — a plain object
describing one element. `tag` is a DOM tag name, or a component function.

```js
// app.js
import { h, mount } from '/framework/index.js'; // or a relative path, see installation.md

function App() {
  return h('div', { class: 'app' }, [
    h('h1', {}, 'Hello, dot-js'),
  ]);
}

mount(App, {}, document.getElementById('app'));
```

Open this in a browser (served over HTTP — see [installation.md](./installation.md))
and you'll see "Hello, dot-js".

## 3. Add local state with `useState`

```js
import { h, mount, useState } from '/framework/index.js';

function Counter() {
  const [count, setCount] = useState(0);
  return h('div', {}, [
    h('p', {}, `Count: ${count}`),
    h('button', { onClick: () => setCount(count + 1) }, 'Increment'),
  ]);
}

mount(Counter, {}, document.getElementById('app'));
```

Click the button — dot-js re-renders, diffs the new tree against the old
one, and updates only the text node that changed.

## 4. Break it into reusable components

```js
function Button({ label, onClick }) {
  return h('button', { onClick }, label);
}

function Counter() {
  const [count, setCount] = useState(0);
  return h('div', {}, [
    h('p', {}, `Count: ${count}`),
    h(Button, { label: '+1', onClick: () => setCount(count + 1) }),
    h(Button, { label: 'Reset', onClick: () => setCount(0) }),
  ]);
}
```

Any function `(props) => vnode` is a component. Reuse it with `h(MyComponent, props)`.

## 5. Share state across components with a store

Local `useState` is great for state that belongs to one component. For state
several unrelated components/pages need (e.g. the list of todos), use a
store instead — see [state.md](./state.md) for the full picture:

```js
import { createStore } from '/framework/index.js';

export const store = createStore({ count: 0 });
```

## Next steps

- [Components](./components.md) — props, composition, local state in depth.
- [State management](./state.md) — sharing state across pages.
- [Routing](./routing.md) — multiple pages driven by the URL.
- [Event handling](./events.md) — delegation, `preventDefault`, bubbling.
- [HTTP](./http.md) — talking to a backend.
- [Performance](./performance.md) — rendering huge lists cheaply.

Or read `/example/todo-app` — a complete app built with all of the above.
