// TodoList.js - keyed rendering: each TodoItem is keyed by todo.id, so
// toggling/editing one todo never re-creates the DOM nodes for the rest.
import { h } from '/framework/index.js';
import { TodoItem } from './TodoItem.js';

const EMPTY_COPY = {
  all: { icon: '🌤️', title: 'All clear.', subtitle: 'Add your first todo above to get started.' },
  active: { icon: '🎉', title: 'Nothing left to do.', subtitle: 'Everything is checked off — nice work.' },
  completed: { icon: '🗒️', title: 'No completed todos yet.', subtitle: 'Check something off to see it here.' },
};

export function TodoList({ todos, onToggle, onEdit, onRemove, filterName = 'all' }) {
  if (todos.length === 0) {
    const copy = EMPTY_COPY[filterName] || EMPTY_COPY.all;
    return h('div', { class: 'empty-state' }, [
      h('div', { class: 'empty-state-icon' }, copy.icon),
      h('p', { class: 'empty-state-title' }, copy.title),
      h('p', { class: 'empty-state-subtitle' }, copy.subtitle),
    ]);
  }
  return h(
    'ul',
    { class: 'todo-list' },
    todos.map((todo) =>
      h(TodoItem, { key: todo.id, todo, onToggle, onEdit, onRemove })
    )
  );
}
