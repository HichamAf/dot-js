import './setup-dom.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { h } from '../src/core/vnode.js';
import { mount } from '../src/core/render.js';
import { useState } from '../src/core/component.js';

test('mount renders a simple element tree', () => {
  const container = document.createElement('div');
  function App() {
    return h('div', { class: 'app' }, [h('h1', {}, 'Hello'), h('p', {}, 'World')]);
  }
  mount(App, {}, container);
  assert.equal(container.querySelector('.app h1').textContent, 'Hello');
  assert.equal(container.querySelector('.app p').textContent, 'World');
});

test('re-render only patches the changed text node, DOM identity of siblings is preserved', async () => {
  const container = document.createElement('div');
  let setCount;
  function Counter() {
    const [count, setC] = useState(0);
    setCount = setC;
    return h('div', {}, [h('span', { key: 'label' }, 'Count:'), h('span', { key: 'value' }, String(count))]);
  }
  mount(Counter, {}, container);
  const labelBefore = container.querySelector('span');
  setCount(1);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(container.querySelectorAll('span')[1].textContent, '1');
  assert.equal(container.querySelector('span'), labelBefore, 'unrelated sibling DOM node must not be recreated');
});

test('keyed list diffing reuses DOM nodes when items are reordered', async () => {
  const container = document.createElement('div');
  let setItems;
  function List(props) {
    return h(
      'ul',
      {},
      props.items.map((item) => h('li', { key: item }, item))
    );
  }
  function App() {
    const [items, setI] = useState(['a', 'b', 'c']);
    setItems = setI;
    return List({ items });
  }
  mount(App, {}, container);
  const liA = [...container.querySelectorAll('li')].find((li) => li.textContent === 'a');
  setItems(['c', 'a', 'b']);
  await Promise.resolve();
  await Promise.resolve();
  const liAAfter = [...container.querySelectorAll('li')].find((li) => li.textContent === 'a');
  assert.equal(liA, liAAfter, 'reordering must move the existing DOM node, not recreate it');
  assert.deepEqual([...container.querySelectorAll('li')].map((li) => li.textContent), ['c', 'a', 'b']);
});

test('component local state (useState) persists across re-renders', async () => {
  const container = document.createElement('div');
  function Child() {
    const [n, setN] = useState(0);
    return h('button', { onClick: () => setN(n + 1) }, `clicked ${n}`);
  }
  mount(Child, {}, container);
  const button = container.querySelector('button');
  button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(button.textContent, 'clicked 1');
});
