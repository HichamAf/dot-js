// db.js - SQLite persistence for todos.
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.TODO_DB_PATH || path.join(__dirname, 'data', 'todos.sqlite');

// Ensure the directory for the database file exists (e.g. a fresh clone
// won't have data/ yet, since the .sqlite files it holds are gitignored).
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export function rowToTodo(row) {
  return { id: row.id, title: row.title, completed: Boolean(row.completed), createdAt: row.created_at };
}
