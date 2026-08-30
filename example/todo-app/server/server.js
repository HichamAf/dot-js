// server.js - REST API for the ToDo example app, plus static hosting
// for the frontend. One process, one `npm start`.
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, rowToTodo } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const FRAMEWORK_SRC_DIR = path.join(__dirname, '..', '..', '..', 'framework', 'src');

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- REST API -------------------------------------------------------

  app.get('/api/todos', (req, res) => {
    const { filter } = req.query;
    let rows;
    if (filter === 'active') rows = db.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY id').all();
    else if (filter === 'completed') rows = db.prepare('SELECT * FROM todos WHERE completed = 1 ORDER BY id').all();
    else rows = db.prepare('SELECT * FROM todos ORDER BY id').all();
    res.json(rows.map(rowToTodo));
  });

  app.post('/api/todos', (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      return res.status(400).json({ error: 'title is required and must not be empty' });
    }
    const result = db.prepare('INSERT INTO todos (title, completed) VALUES (?, 0)').run(title);
    const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(rowToTodo(row));
  });

  app.patch('/api/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: `todo ${id} not found` });

    const title = req.body.title !== undefined ? String(req.body.title).trim() : existing.title;
    if (req.body.title !== undefined && !title) {
      return res.status(400).json({ error: 'title must not be empty' });
    }
    const completed = req.body.completed !== undefined ? Boolean(req.body.completed) : Boolean(existing.completed);

    db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(title, completed ? 1 : 0, id);
    const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(rowToTodo(row));
  });

  app.delete('/api/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: `todo ${id} not found` });
    res.status(204).end();
  });

  // --- Static frontend --------------------------------------------------
  // Serves the actual dot-js framework source directly (no copy, no
  // bundler) so the browser can `import ... from '/framework/index.js'`.
  app.use('/framework', express.static(FRAMEWORK_SRC_DIR));
  app.use(express.static(PUBLIC_DIR));
  // SPA fallback so client-side routes like /active survive a page refresh.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3000;
  createApp().listen(PORT, () => {
    console.log(`dot-js ToDo example running at http://localhost:${PORT}`);
  });
}
