// All API calls to the backend Express server
// Base URL uses React's proxy (set in package.json → "proxy": "http://localhost:5000")

const BASE = '/api/todos';

// Helper: throw error with response message
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// GET all todos with optional filters
export async function fetchTodos(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  const res = await fetch(`${BASE}${query ? '?' + query : ''}`);
  return handleResponse(res);
}

// GET single todo by ID
export async function fetchTodoById(id) {
  const res = await fetch(`${BASE}/${id}`);
  return handleResponse(res);
}

// POST create new todo
export async function createTodo(todo) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  return handleResponse(res);
}

// PUT update todo fully
export async function updateTodo(id, todo) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  return handleResponse(res);
}

// PATCH quick status update
export async function updateTodoStatus(id, status) {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// DELETE single todo
export async function deleteTodo(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// DELETE multiple todos
export async function bulkDeleteTodos(ids) {
  const res = await fetch(`${BASE}/bulk/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return handleResponse(res);
}
