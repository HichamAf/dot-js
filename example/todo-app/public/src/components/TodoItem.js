// TodoItem.js - one row. Reused once per todo via TodoList, with all
// its behavior (edit-in-place, toggle, delete) self-contained.
import { h, useState } from '/framework/index.js';

export function TodoItem({ todo, onToggle, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  if (editing) {
    return h(
      'li',
      { class: 'todo-item editing' },
      [
        h('form', {
          onSubmit: {
            preventDefault: true,
            handler: () => {
              const trimmed = draft.trim();
              if (trimmed) onEdit(todo.id, trimmed);
              setEditing(false);
            },
          },
        }, [
          h('input', {
            type: 'text',
            value: draft,
            autofocus: true,
            onInput: (e) => setDraft(e.target.value),
            onBlur: () => setEditing(false),
          }),
        ]),
      ]
    );
  }

  return h('li', { class: `todo-item${todo.completed ? ' completed' : ''}` }, [
    h('input', {
      type: 'checkbox',
      checked: todo.completed,
      'aria-label': `Mark "${todo.title}" as ${todo.completed ? 'active' : 'complete'}`,
      onChange: (e) => onToggle(todo.id, e.target.checked),
    }),
    h(
      'span',
      {
        class: 'todo-title',
        title: 'Double-click to edit',
        onDblclick: () => { setDraft(todo.title); setEditing(true); },
      },
      todo.title
    ),
    h('button', { class: 'todo-remove', 'aria-label': `Delete "${todo.title}"`, onClick: () => onRemove(todo.id) }, '✕'),
  ]);
}
