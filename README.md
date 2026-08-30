# dot-js + ToDo example

This repository contains two things:

- **`framework/`** — dot-js, a small front-end framework built from scratch
  (no React/Vue/Angular/Svelte/etc.) that lets you describe UIs with plain
  JavaScript. Full documentation: [`framework/docs/README.md`](./framework/docs/README.md).
- **`example/todo-app/`** — a complete ToDo application built with dot-js,
  proving every framework feature works end to end.

## Quick start

Requires Node.js 18+.

```bash
# 1. install the example app's backend dependencies
cd example/todo-app/server
npm install

# 2. run it
npm start
```

Then open **http://localhost:3000** in a browser. That's the whole app —
one process serves both the REST API and the frontend (which imports the
dot-js framework directly from `framework/src/`, no build step, no copy).

### Run the framework's own tests

```bash
cd framework
npm install   # installs jsdom, a test-only dependency for DOM tests
npm test
```

### Run the backend's API tests

```bash
cd example/todo-app/server
npm test
```

## What the ToDo app demonstrates

| Framework feature | Where it's used |
|---|---|
| Components (`h`, reusable functions) | `TodoForm`, `TodoItem`, `TodoList`, `Filters` — each defined once, reused with one line |
| Local component state (`useState`) | Inline-editing a todo, tracking form submission state |
| Shared state (`createStore`) | `store.js` — todos + loading/error status, read from multiple pages |
| Routing (History API) | Real URLs: `/`, `/active`, `/completed`, `/performance` — filtering by URL, "Back to your todos" link |
| Event handling (delegated, declarative) | Add/edit/delete/toggle, form submit with `preventDefault` |
| DOM utilities | Attributes, styles, `readForm()` for the add-todo form |
| HTTP client | All CRUD calls to the Express + SQLite backend go through `http` |
| Performance (list virtualization) | `/performance` route: 5,000-row list, only ~15-20 real DOM nodes at once |

## Primary user journey (verified working)

1. Open the app — the todo list loads from the backend (loading state, then
   the list or an empty-state message).
2. Type a title and submit — a new todo is created via the API and appears
   immediately.
3. Check a todo's checkbox — it's marked complete (persisted).
4. Double-click a todo's text — edit it in place, press Enter to save.
5. Click "Active" / "Completed" / "All" — the URL changes and the list is
   re-fetched filtered by status, entirely without a page reload.
6. Click a todo's ✕ — it's deleted (persisted).
7. Visit `/performance` — scroll a 5,000-row list smoothly.

## Ideas for extending this (for reviewers / early adopters)

A few concrete features that would exercise more of dot-js without changing
its default behavior — any of these is a reasonable "add a feature" exercise:

1. **Due dates & sorting** — add a due-date field to the create form
   (a new `dom`-handled input type), sort/highlight overdue todos, and add
   a `/overdue` route using the existing router.
2. **Drag-to-reorder** — use the native HTML5 drag events (`onDragStart`,
   `onDragOver`, `onDrop` — all just more `on*` props, no framework changes
   needed) to let users reorder todos, backed by a new `order` column and
   a `PATCH /api/todos/reorder` endpoint.
3. **Undo/redo** — extend `store.js` to keep a small history stack of past
   states, with `Ctrl+Z` (a `keydown` handler on `document` via a top-level
   component) restoring the previous state — a good exercise of
   `useEffect` for a global event listener and of the state module's
   `setState` updater-function form.

## Repository layout

```
framework/        the dot-js framework + its docs + its own tests
  src/             core, state, router, events, dom, http, performance, utils
  docs/            full documentation (architecture, features, best practices)
  tests/           node:test unit tests
example/
  todo-app/
    server/        Express + SQLite REST API, also serves the frontend
    public/        the frontend app (components, pages, store) — no build step
```
