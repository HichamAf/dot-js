// store.js - shared application state for the ToDo app, built on the
// framework's state module. Both the TodoPage and the Filters nav read
// from this single store instance, so they always agree on what the
// current list of todos looks like.
import { createStore } from '/framework/index.js';
import { api } from './api.js';

export const store = createStore({
  todos: [],
  status: 'loading', // 'loading' | 'ready' | 'error'
  error: null,
});

export async function loadTodos(filter) {
  store.setState({ status: 'loading', error: null });
  try {
    const todos = await api.list(filter);
    store.setState({ todos, status: 'ready' });
  } catch (err) {
    store.setState({ status: 'error', error: err.message });
  }
}

export async function addTodo(title) {
  const created = await api.create(title);
  store.setState((prev) => ({ todos: [...prev.todos, created] }));
}

export async function toggleTodo(id, completed) {
  const updated = await api.update(id, { completed });
  store.setState((prev) => ({ todos: prev.todos.map((t) => (t.id === id ? updated : t)) }));
}

export async function editTodo(id, title) {
  const updated = await api.update(id, { title });
  store.setState((prev) => ({ todos: prev.todos.map((t) => (t.id === id ? updated : t)) }));
}

export async function removeTodo(id) {
  await api.remove(id);
  store.setState((prev) => ({ todos: prev.todos.filter((t) => t.id !== id) }));
}
