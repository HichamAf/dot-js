import test from 'node:test';
import assert from 'node:assert/strict';
import { http, HttpError } from '../src/http/http.js';

function fakeFetch(responses) {
  let call = 0;
  return async (url, opts) => {
    const res = responses[call++];
    return {
      ok: res.status < 400,
      status: res.status,
      headers: { get: () => 'application/json' },
      json: async () => res.body,
    };
  };
}

test('http.get resolves with parsed JSON on success', async () => {
  globalThis.fetch = fakeFetch([{ status: 200, body: { id: 1, title: 'Buy milk' } }]);
  const data = await http.get('/api/todos/1');
  assert.deepEqual(data, { id: 1, title: 'Buy milk' });
});

test('http.post sends a JSON body and content-type header', async () => {
  let received;
  globalThis.fetch = async (url, opts) => {
    received = opts;
    return { ok: true, status: 201, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) };
  };
  await http.post('/api/todos', { title: 'New' });
  assert.equal(received.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(received.body), { title: 'New' });
});

test('a non-2xx response rejects with an HttpError carrying status + body', async () => {
  globalThis.fetch = fakeFetch([{ status: 404, body: { error: 'not found' } }]);
  await assert.rejects(() => http.get('/api/todos/999'), (err) => {
    assert.ok(err instanceof HttpError);
    assert.equal(err.status, 404);
    assert.deepEqual(err.body, { error: 'not found' });
    return true;
  });
});
