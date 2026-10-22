const json = { 'Content-Type': 'application/json' };

async function call(path, opts = {}) {
  const res = await fetch(path, { credentials: 'same-origin', ...opts });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.detail || 'Что-то пошло не так. Попробуйте ещё раз.');
    err.status = res.status;
    throw err;
  }
  return body;
}

let mePromise = null;

export const api = {
  forms: () => call('/api/forms'),
  form: (slug) => call(`/api/forms/${encodeURIComponent(slug)}`),
  submit: (slug, data) =>
    call(`/api/forms/${encodeURIComponent(slug)}/submissions`, { method: 'POST', headers: json, body: JSON.stringify({ data }) }),
  login: async (username, password) => {
    mePromise = null;
    return call('/api/admin/login', { method: 'POST', headers: json, body: JSON.stringify({ username, password }) });
  },
  logout: async () => {
    mePromise = null;
    return call('/api/admin/logout', { method: 'POST' });
  },
  me: () => {
    mePromise ??= call('/api/admin/me').catch((e) => {
      mePromise = null;
      throw e;
    });
    return mePromise;
  },
  submissions: () => call('/api/admin/submissions'),
};
