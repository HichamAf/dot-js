# State management

dot-js gives you two levels of state, matching two different needs:

- **Local component state** (`useState`, see [components.md](./components.md))
  — for state that belongs to one component and nobody else cares about
  (e.g. "is this dropdown open").
- **Shared state** (`createStore`, this document) — for state multiple
  components, pages, or routes need to read and update consistently
  (e.g. "the list of todos").

## Creating a store

```js
import { createStore } from '/framework/index.js';

export const store = createStore({ todos: [], filter: 'all' });
```

A store has three methods:

```js
store.getState()          // -> current state object
store.setState(partial)   // shallow-merges `partial` into state, notifies subscribers
store.setState(prev => ({ count: prev.count + 1 })) // updater-function form
store.subscribe(listener) // listener(state) called on every change; returns an unsubscribe fn
```

## Reacting to changes / triggering UI updates

`mount()` returns an object with a `rerender()` method. Subscribe your
store to it once, at app startup, and every `setState` call will re-render
the whole app (cheaply — the diff engine only touches what changed):

```js
import { mount } from '/framework/index.js';
import { store } from './store.js';

const app = mount(App, {}, document.getElementById('app'));
store.subscribe(() => app.rerender());
```

Inside any component, just read `store.getState()` during render — no
special "connect" wrapper is required:

```js
function TodoCount() {
  const { todos } = store.getState();
  return h('p', {}, `${todos.length} todos`);
}
```

## Sharing state between elements and pages

Because a store is a plain module-level object, importing the same store
file from two different components (even on two different routes) gives
them the same shared state — no prop-drilling, no context API needed:

```js
// store.js
export const store = createStore({ todos: [] });

// pages/TodoPage.js
import { store } from '../store.js';
// ...store.getState().todos

// components/Filters.js
import { store } from '../store.js';
// ...store.getState().todos.filter(t => !t.completed).length
```

## Managing dependencies between pieces of state

Keep state updates as small, named functions next to the store, rather than
scattering `store.setState(...)` calls through your components — this is
what the example app does in `store.js` (`addTodo`, `toggleTodo`,
`removeTodo`, ...). It keeps every place state can change in one file, and
components only ever call an intention-revealing function:

```js
// store.js
export async function toggleTodo(id, completed) {
  const updated = await api.update(id, { completed });
  store.setState((prev) => ({
    todos: prev.todos.map((t) => (t.id === id ? updated : t)),
  }));
}

// TodoItem.js
h('input', { type: 'checkbox', onChange: (e) => onToggle(todo.id, e.target.checked) })
```

If one piece of state is derived from another (e.g. "remaining count" from
"todos"), just compute it during render rather than storing it separately —
that guarantees it can never drift out of sync:

```js
const remaining = store.getState().todos.filter((t) => !t.completed).length;
```
