# Components

A component is just a function that takes `props` and returns a vnode
(what `h()` produces):

```js
function Greeting(props) {
  return h('p', {}, `Hello, ${props.name}!`);
}
```

Use it anywhere with `h(Greeting, { name: 'Kris' })`. That's the entire
reusability model — no class syntax, no decorators, no registration step.

## Composing components

Components nest just like elements do:

```js
function Card({ title, children }) {
  return h('div', { class: 'card' }, [h('h2', {}, title), ...children]);
}

function App() {
  return h(Card, { title: 'Welcome' }, [h('p', {}, 'Some content')]);
}
```

## Local state: `useState`

```js
import { useState } from '/framework/index.js';

function Toggle() {
  const [on, setOn] = useState(false);
  return h('button', { onClick: () => setOn(!on) }, on ? 'ON' : 'OFF');
}
```

`useState(initial)` returns `[value, setValue]`. `initial` may be a plain
value or a function (evaluated once, useful for expensive initial state,
e.g. `useState(() => expensiveCompute())`).

Calling `setValue` schedules a re-render of the app. Only the DOM affected
by whatever actually changed gets touched, thanks to the diff engine.

**Rule: only call `useState`/`useEffect` directly inside a component
function's body**, not inside conditionals, loops, or callbacks — the same
rule React's hooks follow, and for the same reason: hook call order must be
stable across renders so state lines up correctly.

## Side effects: `useEffect`

```js
import { useEffect } from '/framework/index.js';

function TodoPage({ filterName }) {
  useEffect(() => {
    loadTodos(filterName); // re-run whenever filterName changes
  }, [filterName]);
  // ...
}
```

- `useEffect(fn)` (no deps array) — runs after every render.
- `useEffect(fn, [])` — runs once, after the first render.
- `useEffect(fn, [a, b])` — runs when `a` or `b` change since the last render.
- Return a cleanup function from `fn` to run before the effect re-runs, or
  when a value the effect depends on changes.

## Reusability in practice

The example ToDo app's `TodoItem` component (see
`/example/todo-app/public/src/components/TodoItem.js`) is defined once and
reused for every todo in the list with a single line:

```js
todos.map((todo) => h(TodoItem, { key: todo.id, todo, onToggle, onEdit, onRemove }))
```

Always pass a stable `key` (e.g. a database id) when rendering a list of
components — see [performance.md](./performance.md) for why this matters.
