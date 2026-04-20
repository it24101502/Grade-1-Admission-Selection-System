// FILE: frontend/src/services/api.js
import axios from 'axios';

// In dev, use same-origin /api so CRA proxy (package.json) forwards to :8080 — avoids CORS issues.
// Set REACT_APP_API_URL if the UI is hosted separately from the API.
const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:8080/api');

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isLoginAttempt = url.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginAttempt) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default API;

// ── AUTH ──────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    API.post('/auth/login', { username, password }),
};

// ── DOCUMENT CONTROLLER ───────────────────────────────────────
export const dcApi = {
  createParentLogin: (fullName, email, nic) =>
    API.post('/dc/create-login', { fullName, email, nic }),
  getAllParents: () =>
    API.get('/dc/parents'),
  addCategorySlot: (parentId, category, displayLabel) =>
    API.post(`/dc/parents/${parentId}/slots`, { category, displayLabel }),
  removeCategorySlot: (slotId) =>
    API.delete(`/dc/slots/${slotId}`),
  resetPassword: (id) =>
    API.put(`/dc/parents/${id}/reset-password`),
  toggleActive: (id, active) =>
    API.put(`/dc/parents/${id}/toggle-active`, { active }),
};

// ── PARENT ────────────────────────────────────────────────────
export const parentApi = {
  // Get all category slots assigned by DC (parent dashboard list)
  getMySlots: () =>
    API.get('/parent/slots'),
  // Submit application for a specific slot
  submitForSlot: (slotId, data) =>
    API.post(`/parent/slots/${slotId}/apply`, data),
  // Legacy - get all submitted applications
  getMyApplications: () =>
    API.get('/parent/applications'),
  changePassword: (currentPassword, newPassword) =>
    API.put('/parent/change-password', { currentPassword, newPassword }),
};

// ── JUDGE ─────────────────────────────────────────────────────
export const judgeApi = {
  getStats: () =>         API.get('/judge/stats'),
  getApplications: () =>  API.get('/judge/applications'),
  getApplicationDetail: (id) => API.get(`/judge/applications/${id}`),
  enterMarks: (id, marks, visitComment) =>
    API.put(`/judge/applications/${id}/marks`, { marks, visitComment }),
  toggleFlag: (id, flagged, flagReason) =>
    API.put(`/judge/applications/${id}/flag`, { flagged, flagReason }),
  getRanked: () => API.get('/judge/ranked'),
};

// ── ADMIN ─────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => API.get('/admin/stats'),
  getAllApplications: (category, status) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status)   params.append('status', status);
    return API.get(`/admin/applications?${params}`);
  },
  getRankedByCategory: (category) => API.get(`/admin/ranked/${category}`),
  getFlagged: () =>          API.get('/admin/flagged'),
  getJudgeProgress: () =>    API.get('/admin/judges'),
  publishResults: (selections) => API.post('/admin/publish-results', selections),
  overrideStatus: (id, status) =>
    API.put(`/admin/applications/${id}/status`, { status }),
};