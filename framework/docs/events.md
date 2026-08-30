# Event handling

## Declare handlers, don't call `addEventListener`

In dot-js, an event handler is part of an element's description, declared
at the point you create it with `h()` — the same way you'd declare `class`
or `style`. You never call `addEventListener` in application code:

```js
h('button', { onClick: () => save() }, 'Save')
h('input', { onInput: (e) => setValue(e.target.value) })
h('form', { onSubmit: (e) => { /* ... */ } })
```

Any DOM event works this way: `onClick` → `click`, `onInput` → `input`,
`onSubmit` → `submit`, `onDblclick` → `dblclick`, `onChange` → `change`,
`onKeydown` → `keydown`, and so on (the prop name is `on` + the event name).

## Why not just `addEventListener`?

Two reasons. First, matching how the DOM is described declaratively — a
handler is part of *what the button is*, not an imperative step performed
after creating it, so it automatically stays attached correctly across
re-renders without any manual re-wiring. Second, performance: dot-js
attaches exactly **one real browser listener per event type**, no matter
how many buttons/inputs/etc. use that event — see "Delegation" below.

## Delegation

Internally, the first time any element declares (say) an `onClick` handler,
dot-js attaches a single `click` listener on the app's root container. When
a click happens anywhere inside the app, that one listener walks up from
`event.target` to find the closest element with a matching handler and
calls it. This is "event delegation to a parent element" — it means adding
a thousand buttons costs zero extra real listeners, and newly-created
elements (e.g. a new todo item) work immediately with no re-attachment step.

## Preventing default behavior and controlling bubbling

Pass a config object instead of a bare function to control `preventDefault`
and `stopPropagation`:

```js
h('form', {
  onSubmit: {
    handler: (e) => save(),
    preventDefault: true, // stop the browser's native form submit/reload
  },
})

h('button', {
  onClick: {
    handler: (e) => deleteItem(id),
    stopPropagation: true, // don't let an ancestor's onClick also fire
  },
})
```

You can also call `event.preventDefault()` / `event.stopPropagation()`
yourself inside a plain handler function — both styles work, since the
underlying object is a real, standard DOM `Event`.

## Forms and user input

Read a form's fields on submit with `readForm` (from the `dom` module),
rather than tracking every keystroke in state unless you need to:

```js
import { h, readForm } from '/framework/index.js';

h('form', {
  onSubmit: {
    preventDefault: true,
    handler: (e) => {
      const { title } = readForm(e.target, ['title']);
      addTodo(title);
      e.target.reset();
    },
  },
}, [h('input', { name: 'title' }), h('button', { type: 'submit' }, 'Add')])
```

For controlled inputs (value driven by state, e.g. an inline-edit field),
use `onInput` with `useState`, as `TodoItem`'s edit mode does — see
`/example/todo-app/public/src/components/TodoItem.js`.
