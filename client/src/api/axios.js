/**
 * Fetch-based API client (no axios). Same interface: api.get(), api.post(), api.put(), api.delete()
 */

/**
 * Production: set REACT_APP_API_URL on your host (e.g. Vercel) before build — no trailing slash.
 * Local dev: leave unset to use CRA proxy → http://localhost:5000
 */
const baseURL = process.env.REACT_APP_API_URL || '';
const apiRoot = baseURL ? `${baseURL}/api` : '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    const path = window.location.pathname;
    if (path.startsWith('/admin') && !path.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { message: res.statusText };
    }
  }
  if (!res.ok) {
    const err = new Error(data.message || res.statusText);
    err.response = { status: res.status, data };
    throw err;
  }
  return { data };
}

const api = {
  get(url) {
    return fetch(`${apiRoot}${url}`, {
      method: 'GET',
      credentials: 'include',
      headers: getHeaders(),
    }).then(handleResponse);
  },
  post(url, body) {
    return fetch(`${apiRoot}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse);
  },
  put(url, body) {
    return fetch(`${apiRoot}${url}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse);
  },
  delete(url) {
    return fetch(`${apiRoot}${url}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    }).then(handleResponse);
  },
};

export default api;
