# Performance

dot-js gets efficient updates from two things working together: **keyed
diffing** (always on, part of the core engine) and **list virtualization**
(an opt-in component, for very large lists).

## Keyed diffing (built in)

When you render a list of children, always give each one a stable `key`
(usually a database id — never the array index if the list can reorder):

```js
todos.map((todo) => h(TodoItem, { key: todo.id, todo }))
```

With keys, adding, removing, reordering, or updating one item in a
1,000-item list patches only that one item's DOM node — the other 999 are
left completely untouched (verified in
`framework/tests/core.test.js`, "keyed list diffing reuses DOM nodes when
items are reordered"). Without keys, dot-js falls back to matching children
by position, which can cause unnecessary DOM recreation when a list's order
changes.

## List virtualization: `VirtualList`

For lists too large to comfortably put in the DOM at all — the task's own
example is a dropdown with 10,000 options — keyed diffing alone isn't
enough, because the *first* render still has to create every row. `VirtualList`
solves this by only ever creating DOM nodes for the rows currently scrolled
into view (plus a small overscan buffer), regardless of how many items exist:

```js
import { VirtualList } from '/framework/index.js';

h(VirtualList, {
  items: fiveThousandItems,   // the full array — never all rendered at once
  itemHeight: 32,             // fixed row height in px
  height: 400,                // visible viewport height in px
  overscan: 5,                // extra rows rendered above/below the viewport
  getKey: (item) => item.id,
  renderItem: (item, index) => h('div', {}, item.label),
})
```

Internally it tracks scroll position with `useState`, computes which slice
of `items` is currently visible, and absolutely-positions just that slice
inside a full-height spacer `<div>` (so the scrollbar behaves like it would
for the whole list). See `/example/todo-app/public/src/pages/PerformanceDemoPage.js`
for a runnable demo: a 5,000-row list where only ~15-20 rows are ever real
DOM nodes at once, at `/performance` in the example app.

## When to reach for `VirtualList`

- Dozens to low hundreds of items: plain keyed lists are fine, don't bother.
- Thousands of items, or rows with heavier content: use `VirtualList`.
- If row heights vary, either pick a fixed height that fits your content,
  or measure and cache per-row heights yourself before passing them in —
  `VirtualList`'s current implementation assumes a fixed `itemHeight`, which
  keeps the scroll-position math simple and fast.

## Batched re-renders

Multiple `setState`/`useState` updates that happen within the same tick are
automatically coalesced into a single re-render (`mount()`'s scheduler uses
a microtask), so a burst of rapid changes never produces more than one
diff/patch pass.
