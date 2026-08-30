// api.js - talks to the backend REST API using the framework's http module.
import { http } from '/framework/index.js';

const BASE = '/api/todos';

export const api = {
  list: (filter) => http.get(filter && filter !== 'all' ? `${BASE}?filter=${filter}` : BASE),
  create: (title) => http.post(BASE, { title }),
  update: (id, changes) => http.patch(`${BASE}/${id}`, changes),
  remove: (id) => http.delete(`${BASE}/${id}`),
};
