// http/http.js
// Thin, friendly wrapper around fetch() so applications can talk to a
// remote API without repeating boilerplate (JSON headers, error
// handling, parsing). Returns plain promises so it composes naturally
// with the state module (e.g. call http.get() then store.setState()).

class HttpError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

async function request(method, url, { body, headers = {}, ...rest } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    throw new HttpError(`HTTP ${response.status} for ${method} ${url}`, response.status, data);
  }
  return data;
}

export const http = {
  get: (url, options) => request('GET', url, options),
  post: (url, body, options) => request('POST', url, { ...options, body }),
  put: (url, body, options) => request('PUT', url, { ...options, body }),
  patch: (url, body, options) => request('PATCH', url, { ...options, body }),
  delete: (url, options) => request('DELETE', url, options),
};

export { HttpError };
