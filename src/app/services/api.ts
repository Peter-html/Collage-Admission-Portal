/**
 * API Service Layer
 * Centralizes all backend communication for the ST.JOSEPH Admission Portal
 *
 * In development: uses Vite proxy → /api → http://localhost:5000/api (no CORS)
 * In production:  uses VITE_API_URL env variable
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem('token');
export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const saveAuth = (token: string, user: object) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
export const isLoggedIn = () => !!getToken();
export const isManager = () => getUser()?.role === 'manager';

// ─── Base fetch helper ────────────────────────────────────────────────────────
const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: () => apiFetch('/auth/me'),
};

// ─── Courses API ──────────────────────────────────────────────────────────────
export const coursesAPI = {
  getAll: () => apiFetch('/courses'),
  getOne: (id: string) => apiFetch(`/courses/${id}`),
  create: (data: object) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
  getAllAdmin: () => apiFetch('/courses/admin/all'),
};

// ─── Applications API ─────────────────────────────────────────────────────────
export const applicationsAPI = {
  submit: (data: object) => apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => apiFetch('/applications/my'),
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/applications${qs}`);
  },
  getOne: (id: string) => apiFetch(`/applications/${id}`),
  approve: (id: string) => apiFetch(`/applications/${id}/approve`, { method: 'PUT' }),
  reject: (id: string, reason?: string) =>
    apiFetch(`/applications/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  getDashboardStats: () => apiFetch('/applications/stats/dashboard'),
  getMeritList: (courseId: string) => apiFetch(`/applications/merit/${courseId}`),
};
