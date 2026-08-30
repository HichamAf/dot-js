// TodoPage.js - the main page: composes TodoForm + Filters + TodoList,
// and reacts to both shared app state (store) and the URL (router).
import { h, useEffect } from '/framework/index.js';
import { store, loadTodos, addTodo, toggleTodo, editTodo, removeTodo } from '../store.js';
import { TodoForm } from '../components/TodoForm.js';
import { TodoList } from '../components/TodoList.js';
import { Filters } from '../components/Filters.js';

export function TodoPage({ router, filterName }) {
  useEffect(() => {
    loadTodos(filterName);
  }, [filterName]);

  const { todos, status, error } = store.getState();
  const remaining = todos.filter((t) => !t.completed).length;

  return h('main', { class: 'todo-page' }, [
    h('h1', {}, '📝 ToDo — built with dot-js'),
    h(TodoForm, { onAdd: addTodo }),
    h(Filters, { router, current: filterName }),
    status === 'loading' ? h('p', { class: 'status-loading' }, 'Loading todos…') : null,
    status === 'error' ? h('p', { class: 'status-error', role: 'alert' }, `Couldn't load todos: ${error}`) : null,
    status === 'ready'
      ? h(TodoList, { todos, onToggle: toggleTodo, onEdit: editTodo, onRemove: removeTodo, filterName })
      : null,
    status === 'ready' ? h('p', { class: 'todo-count' }, `${remaining} item${remaining === 1 ? '' : 's'} left`) : null,
  ]);
}
