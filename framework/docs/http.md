# HTTP client

The `http` module is a thin `fetch()` wrapper: JSON in, JSON out, with
errors you can actually handle.

```js
import { http, HttpError } from '/framework/index.js';

const todos = await http.get('/api/todos');
const created = await http.post('/api/todos', { title: 'Buy milk' });
const updated = await http.patch(`/api/todos/${id}`, { completed: true });
await http.delete(`/api/todos/${id}`);
```

- `http.get(url, options?)`
- `http.post(url, body, options?)`
- `http.put(url, body, options?)`
- `http.patch(url, body, options?)`
- `http.delete(url, options?)`

`body` is automatically JSON-stringified and sent with a
`Content-Type: application/json` header. The response is automatically
parsed as JSON when the server says `Content-Type: application/json`,
otherwise returned as plain text.

## Error handling

A non-2xx response rejects the promise with an `HttpError`, carrying the
status code and parsed response body, instead of silently returning
whatever the server sent:

```js
try {
  await http.post('/api/todos', { title: '' });
} catch (err) {
  if (err instanceof HttpError) {
    console.log(err.status);       // 400
    console.log(err.body);         // { error: 'title is required...' }
  }
}
```

## Typical pattern: combine with state

Wire API calls into store actions, so components never call `http`
directly — they call an intention-revealing function that updates shared
state when the request resolves (see [state.md](./state.md)):

```js
// store.js
export async function loadTodos() {
  store.setState({ status: 'loading' });
  try {
    const todos = await http.get('/api/todos');
    store.setState({ todos, status: 'ready' });
  } catch (err) {
    store.setState({ status: 'error', error: err.message });
  }
}
```

This is exactly the pattern `/example/todo-app/public/src/store.js` uses,
and it's what gives the ToDo app its loading/error/ready states for free.
