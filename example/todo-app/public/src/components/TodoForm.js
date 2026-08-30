// TodoForm.js - a reusable component: describe it once, drop it
// anywhere with <= 1 line of code (TodoForm({ onAdd })).
import { h, useState, readForm } from '/framework/index.js';

export function TodoForm({ onAdd }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    const { title } = readForm(event.target, ['title']);
    if (!title || !title.trim()) {
      setError('Please enter a todo before adding it.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onAdd(title.trim());
      event.target.reset();
    } catch (err) {
      setError(err.message || 'Could not add todo.');
    } finally {
      setPending(false);
    }
  };

  return h('form', { class: 'todo-form', onSubmit: { handler: handleSubmit, preventDefault: true } }, [
    h('input', {
      name: 'title',
      type: 'text',
      placeholder: 'What needs doing?',
      'aria-label': 'New todo title',
      autofocus: true,
      disabled: pending,
    }),
    h('button', { type: 'submit', disabled: pending }, pending ? 'Adding…' : 'Add'),
    error ? h('p', { class: 'form-error', role: 'alert' }, error) : null,
  ]);
}
