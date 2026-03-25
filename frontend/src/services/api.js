// FILE: frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired sessions
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
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
  resetPassword: (id) =>
    API.put(`/dc/parents/${id}/reset-password`),
  toggleActive: (id, active) =>
    API.put(`/dc/parents/${id}/toggle-active`, { active }),
};

// ── PARENT ────────────────────────────────────────────────────
export const parentApi = {
  submitApplication: (data) =>
    API.post('/parent/applications', data),
  getMyApplications: () =>
    API.get('/parent/applications'),
  changePassword: (currentPassword, newPassword) =>
    API.put('/parent/change-password', { currentPassword, newPassword }),
};

// ── JUDGE (Step 5 & 6) ────────────────────────────────────────
export const judgeApi = {
  getStats: () =>
    API.get('/judge/stats'),
  getApplications: () =>
    API.get('/judge/applications'),
  getApplicationDetail: (id) =>
    API.get(`/judge/applications/${id}`),
  enterMarks: (id, marks, visitComment) =>
    API.put(`/judge/applications/${id}/marks`, { marks, visitComment }),
  toggleFlag: (id, flagged, flagReason) =>
    API.put(`/judge/applications/${id}/flag`, { flagged, flagReason }),
  getRanked: () =>
    API.get('/judge/ranked'),
};

// ── ADMIN (Step 7) ────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    API.get('/admin/stats'),
  getAllApplications: (category, status) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status)   params.append('status',   status);
    return API.get(`/admin/applications?${params}`);
  },
  getRankedByCategory: (category) =>
    API.get(`/admin/ranked/${category}`),
  getFlagged: () =>
    API.get('/admin/flagged'),
  getJudgeProgress: () =>
    API.get('/admin/judges'),
  publishResults: (selections) =>
    API.post('/admin/publish-results', selections),
  overrideStatus: (id, status) =>
    API.put(`/admin/applications/${id}/status`, { status }),
};