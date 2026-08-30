# Architecture & design principles

## The core idea

dot-js applications are trees of plain JavaScript function calls that describe
what the UI *should* look like right now. dot-js takes that description,
compares it to what's actually in the DOM, and makes the smallest possible
set of changes to catch up. You never touch the DOM directly.

```
your code (h() calls) -> virtual node tree -> diff against previous tree -> patch real DOM
```

## Design principles

- **No build step.** Everything is standard ES modules. Open `index.html`
  with a `<script type="module">` and it runs in any modern browser.
- **No hidden magic.** State changes are explicit (`store.setState(...)`,
  `setSomething(...)`); nothing is auto-tracked behind a proxy.
- **Small, composable modules.** Each concern (state, routing, events, DOM,
  HTTP, performance) is a separate, independently understandable module.
  Use only what you need.
- **Declarative events.** You never call `addEventListener` yourself.
  Handlers are declared as part of an element's description (`onClick: fn`),
  the same way `class` or `style` are declared — see [events.md](./events.md).

## The pieces

| Module | Responsibility |
|---|---|
| `core` | `h()` to describe elements, the virtual DOM diff/patch engine, component instances and hooks (`useState`, `useEffect`), and `mount()` to start an app. |
| `dom` | Low-level element creation and prop/attribute/style application. Used internally by `core`; exposed for direct use (e.g. `readForm`). |
| `events` | A single delegated listener per event type, dispatched to whichever element declared a handler for it. |
| `state` | `createStore()` — a tiny observable store for state shared across components and pages. |
| `router` | History-API-based routing: matches the current URL to a route, and lets you `navigate()` programmatically. |
| `http` | A `fetch()` wrapper with JSON handling and typed errors. |
| `performance` | `VirtualList` — windowed rendering for very large lists. |

## Rendering model

Every component is a function: `(props) => vnode`. Calling `h(ComponentFn, props)`
embeds it in a tree, exactly like `h('div', props)` embeds an element.

When any state changes (via a store or via `useState`), dot-js re-runs your
root component to get a **new** vnode tree, and diffs it against the tree
from the last render:

- Same element type at the same position → patch its attributes in place.
- A list of children → matched by `key` (not position), so reordering,
  inserting, or removing one item never touches the DOM nodes of the others.
- Different element type, or a node with no old counterpart at that key →
  replaced or created.

This is the same idea as React/Vue's virtual DOM, kept intentionally small:
there is no synthetic event system beyond what [events.md](./events.md)
describes, no fibers/scheduling priorities, and no server rendering — just
enough to build and update a real UI correctly and efficiently.

## Component state: hooks

A component can hold its own local state with `useState`, the same hook
pattern popularized by React. State lives outside the vnode tree (in an
instance keyed by the component's stable position in the tree), so it
survives across re-renders. See [components.md](./components.md).

## Where things fit for a typical app

```
app.js         - creates the router + store, calls mount(App, {}, container)
store.js       - shared state (createStore) + functions that update it
components/*.js - small, reusable h()-returning functions
pages/*.js     - components that represent a whole route/page
```
