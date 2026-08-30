import './setup-dom.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRouter } from '../src/router/router.js';

test('router matches the current path to a route and extracts params', () => {
  window.history.pushState({}, '', '/todos/42');
  const router = createRouter([
    { path: '/', name: 'home' },
    { path: '/todos/:id', name: 'todo-detail' },
  ]);
  const { route, params } = router.current();
  assert.equal(route.name, 'todo-detail');
  assert.equal(params.id, '42');
});

test('navigate() changes the URL without a full page reload and notifies subscribers', () => {
  window.history.pushState({}, '', '/');
  const router = createRouter([
    { path: '/', name: 'home' },
    { path: '/active', name: 'active' },
  ]);
  let notified = null;
  router.subscribe((state) => (notified = state));
  router.navigate('/active');
  assert.equal(window.location.pathname, '/active');
  assert.equal(notified.route.name, 'active');
});

test('unmatched paths fall back to a wildcard route when defined', () => {
  window.history.pushState({}, '', '/nope');
  const router = createRouter([
    { path: '/', name: 'home' },
    { path: '*', name: 'not-found' },
  ]);
  assert.equal(router.current().route.name, 'not-found');
});
