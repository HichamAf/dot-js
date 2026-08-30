# Best practices & guidelines

## Structuring an app

```
app.js          - creates router + store, calls mount(), wires subscriptions
store.js        - one shared store + named action functions (addX, removeX, ...)
api.js          - one place that talks to your backend (wraps `http`)
components/     - small, reusable, presentation-focused h()-returning functions
pages/          - components representing a whole route, composed from components/
styles/         - plain CSS (dot-js has no built-in styling system, and doesn't need one)
```

This is exactly the shape of `/example/todo-app/public/src`.

## Keys, always

Any time you render an array of elements or components, pass a stable
`key` (an id from your data, not the array index unless the list is
strictly append-only and never reordered/filtered). See
[performance.md](./performance.md) for why.

## Keep components small and presentation-focused

A component should describe *what to render given its props*, not reach
into global state directly unless it's genuinely page-level (like the
example's `TodoPage`, which reads the store because it *is* the "todos
page"). Prefer passing data and callbacks down as props (`todo`, `onToggle`)
over every leaf component importing the store itself — it keeps components
reusable and easy to test/reason about in isolation.

## Put side effects in `useEffect`, not in the render body

Fetching data, subscribing to something external, or scheduling a timer
belongs in `useEffect`, with an accurate dependency array — never directly
in a component's function body (which runs on every single render).

## Derive, don't duplicate

If a value can be computed from existing state (a filtered list, a count,
a "remaining items" total), compute it during render instead of storing a
second, separately-updated copy — see the `remaining` example in
[state.md](./state.md). Duplicated state is the most common source of UI
bugs where two parts of the screen disagree.

## Validate at the boundary

Validate user input as close to where it enters the system as possible.
The example app's server rejects an empty-title todo with `400` before it
ever touches the database (`example/todo-app/server/server.js`), and the
`TodoForm` component *also* checks for an empty title before calling the
API — cheap client-side feedback, backed by a real server-side guarantee
that can't be bypassed by a different client.

## Handle loading and error states explicitly

Every place you call `http`, represent (and render) at least three states:
loading, error, and success — never assume a request just works. See
`TodoPage`'s `status` field (`'loading' | 'ready' | 'error'`) for the
pattern.

## Accessibility basics

- Use real semantic elements (`<button>`, `<nav>`, `<form>`, `<label>`) —
  dot-js renders exactly the HTML you describe, so accessibility is on you,
  same as writing HTML by hand.
- Add `aria-label` to icon-only controls (see `TodoItem`'s delete button).
- Make sure interactive elements are real `<button>`/`<a>` tags (keyboard-
  focusable and activatable by default), not `<div onClick>`.

## Testing

Write unit tests for pure logic (store actions, route matching) with plain
Node's `node:test` — no DOM needed. For anything touching the rendered DOM,
use `jsdom` as a test-only dependency (see `framework/tests/setup-dom.js`);
it's a DOM implementation for Node, not a UI framework, so it doesn't
conflict with the "build it yourself" spirit of the project.
