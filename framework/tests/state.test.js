import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/state/store.js';

test('store stores and updates state', () => {
  const store = createStore({ count: 0 });
  assert.equal(store.getState().count, 0);
  store.setState({ count: 1 });
  assert.equal(store.getState().count, 1);
});

test('store setState accepts an updater function', () => {
  const store = createStore({ count: 5 });
  store.setState((prev) => ({ count: prev.count + 1 }));
  assert.equal(store.getState().count, 6);
});

test('subscribers are notified on every change and can unsubscribe', () => {
  const store = createStore({ count: 0 });
  let calls = 0;
  const unsubscribe = store.subscribe(() => (calls += 1));
  store.setState({ count: 1 });
  store.setState({ count: 2 });
  assert.equal(calls, 2);
  unsubscribe();
  store.setState({ count: 3 });
  assert.equal(calls, 2, 'no more calls after unsubscribe');
});

test('two consumers of the same store see the same shared state', () => {
  const store = createStore({ user: null });
  const readOnPageA = () => store.getState().user;
  const readOnPageB = () => store.getState().user;
  store.setState({ user: 'kris' });
  assert.equal(readOnPageA(), 'kris');
  assert.equal(readOnPageB(), 'kris');
});
