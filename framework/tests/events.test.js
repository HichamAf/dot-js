import './setup-dom.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { h } from '../src/core/vnode.js';
import { mount } from '../src/core/render.js';

test('click handler declared in props fires, and is delegated (one root listener)', async () => {
  const container = document.createElement('div');
  let clicked = 0;
  function App() {
    return h('div', {}, [h('button', { onClick: () => (clicked += 1) }, 'Go')]);
  }
  mount(App, {}, container);
  container.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(clicked, 1);
});

test('preventDefault:true stops the default browser action on a form submit', async () => {
  const container = document.createElement('div');
  let submitted = false;
  function App() {
    return h('form', { onSubmit: { handler: () => (submitted = true), preventDefault: true } }, [
      h('button', { type: 'submit' }, 'Save'),
    ]);
  }
  mount(App, {}, container);
  const form = container.querySelector('form');
  const event = new window.Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  assert.equal(submitted, true);
  assert.equal(event.defaultPrevented, true);
});

test('a click on a nested child still reaches a handler on its parent (delegation/bubbling)', () => {
  const container = document.createElement('div');
  let parentSawIt = false;
  function App() {
    return h('div', { onClick: () => (parentSawIt = true) }, [h('span', {}, [h('strong', {}, 'click me')])]);
  }
  mount(App, {}, container);
  container.querySelector('strong').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(parentSawIt, true);
});

test('stopPropagation:true on a child handler prevents an ancestor handler from firing', () => {
  const container = document.createElement('div');
  let parentSawIt = false;
  let childSawIt = false;
  function App() {
    return h('div', { onClick: () => (parentSawIt = true) }, [
      h('button', { onClick: { handler: () => (childSawIt = true), stopPropagation: true } }, 'Click'),
    ]);
  }
  mount(App, {}, container);
  container.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(childSawIt, true);
  assert.equal(parentSawIt, false);
});
