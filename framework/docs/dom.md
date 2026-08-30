# DOM utilities

You should rarely need these directly — `h()` plus the diff engine handles
element creation, nesting, attributes, and styles for you. This page covers
what happens under the hood, plus the couple of helpers meant for direct use.

## Creating and nesting elements

```js
h('ul', { class: 'list' }, [
  h('li', {}, 'First'),
  h('li', {}, 'Second'),
])
```

`h(tag, props, children)` — `children` can be a single vnode, a string, an
array (nested arrays are flattened automatically), or a mix. Falsy values
(`null`, `false`, `undefined`) in `children` are dropped, so conditional
rendering is just:

```js
h('div', {}, [
  isLoading ? h('p', {}, 'Loading...') : null,
  h('p', {}, 'Always shown'),
])
```

## Attributes and styles

```js
h('input', { type: 'text', placeholder: 'Title', disabled: false })
h('div', { style: { color: 'red', fontWeight: 'bold' } })
h('div', { class: 'card highlighted' })
```

- `style` accepts a plain object (camelCase keys, like `el.style` itself).
- `class` (or `className`) sets the `class` attribute directly.
- Boolean DOM properties (`checked`, `disabled`, `selected`, `readOnly`,
  `required`, `multiple`, `autofocus`) are set as real element properties,
  not just string attributes, so checkboxes/inputs behave correctly.
- `value` on form controls is kept in sync without resetting cursor
  position unnecessarily.
- Any other prop becomes a plain HTML attribute via `setAttribute`.

Only props that actually changed between renders are touched — see
`applyProps` in `framework/src/dom/dom.js` if you're curious how the diff
decides what to update.

## Handling user input and form submissions

See [events.md](./events.md) for the full picture (`onInput`, `onChange`,
`onSubmit`). The `readForm(formElement, fieldNames)` helper reads named
field values out of a real `<form>` element in one call:

```js
import { readForm } from '/framework/index.js';

const { title, priority } = readForm(formEl, ['title', 'priority']);
```

## Direct DOM escape hatch

If you ever need it, `createDomElement(vnode, rootContainer)` (from
`framework/src/dom/dom.js`) turns a resolved vnode into a real DOM node.
Application code normally never needs this — `mount()` and the diff engine
call it for you.
