import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Use a throwaway SQLite file per test run so tests never touch real data.
const tmpDb = path.join(os.tmpdir(), `todo-test-${Date.now()}.sqlite`);
process.env.TODO_DB_PATH = tmpDb;
const { createApp } = await import('../server.js');

const app = createApp();
const server = app.listen(0);
const { port } = server.address();
const base = `http://localhost:${port}`;

test.after(() => {
  server.close();
  fs.rmSync(tmpDb, { force: true });
});

test('GET /api/todos starts empty', async () => {
  const res = await fetch(`${base}/api/todos`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('POST /api/todos creates a todo, rejects an empty title', async () => {
  const created = await fetch(`${base}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Buy milk' }),
  });
  assert.equal(created.status, 201);
  const todo = await created.json();
  assert.equal(todo.title, 'Buy milk');
  assert.equal(todo.completed, false);

  const rejected = await fetch(`${base}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ' }),
  });
  assert.equal(rejected.status, 400);
});

test('PATCH /api/todos/:id toggles completed, filters work, DELETE removes it', async () => {
  const created = await (
    await fetch(`${base}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Walk the dog' }),
    })
  ).json();

  const patched = await fetch(`${base}/api/todos/${created.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  });
  assert.equal((await patched.json()).completed, true);

  const activeList = await (await fetch(`${base}/api/todos?filter=active`)).json();
  assert.ok(!activeList.some((t) => t.id === created.id));
  const completedList = await (await fetch(`${base}/api/todos?filter=completed`)).json();
  assert.ok(completedList.some((t) => t.id === created.id));

  const deleted = await fetch(`${base}/api/todos/${created.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);

  const missing = await fetch(`${base}/api/todos/${created.id}`, { method: 'DELETE' });
  assert.equal(missing.status, 404);
});
