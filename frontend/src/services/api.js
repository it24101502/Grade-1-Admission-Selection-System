// FILE: frontend/src/services/api.js
import axios from 'axios';

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
    const isLoginCall = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginCall) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default API;

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) => API.post('/auth/login', { username, password }),
};

// ── DOCUMENT CONTROLLER ───────────────────────────────────────────────────────
export const dcApi = {
  checkParent:   (phone, nic, childName, category) =>
    API.post('/dc/parents/check',   { phone, nic, childName, category }),
  confirmParent: (phone, nic, childName, category) =>
    API.post('/dc/parents/confirm', { phone, nic, childName, category }),
  getAllParents:  ()           => API.get('/dc/parents'),
  resetPassword: (id)         => API.put(`/dc/parents/${id}/reset-password`),
  setActive:     (id, active) => API.put(`/dc/parents/${id}/active`, { active }),
  removeSlot:    (slotId)     => API.delete(`/dc/slots/${slotId}`),

  getSchemesSummary: ()       => API.get('/dc/schemes/summary'),
  getAllSchemes:      ()       => API.get('/dc/schemes'),
  getActiveScheme:   (cat)    => API.get(`/dc/schemes/category/${cat}`),
  getSchemeHistory:  (cat)    => API.get(`/dc/schemes/category/${cat}/history`),
  createScheme:      (category, title, criteria) =>
    API.post('/dc/schemes', { category, title, criteria }),
  updateScheme:      (id, updates)    => API.put(`/dc/schemes/${id}`, updates),
  addCriterion:      (schemeId, criterion) =>
    API.post(`/dc/schemes/${schemeId}/criteria`, criterion),
  removeCriterion:   (criterionId) => API.delete(`/dc/criteria/${criterionId}`),
};

// ── PARENT ────────────────────────────────────────────────────────────────────
export const parentApi = {
  getMySlots:    ()  => API.get('/parent/slots'),
  getMyStatus:   ()  => API.get('/parent/status'),
  submitApplication: (childId, category, data) =>
    API.post(`/parent/application/${childId}/${category}`, data),
  changePassword: (currentPassword, newPassword) =>
    API.put('/parent/change-password', { currentPassword, newPassword }),
};

// ── USER (Judge panel) ────────────────────────────────────────────────────────
export const userApi = {
  getStats:             ()    => API.get('/user/stats'),
  getApplications:      ()    => API.get('/user/applications'),
  getApplicationDetail: (id)  => API.get(`/user/applications/${id}`),

  // Returns the active marking scheme for this user's category
  getScheme: () => API.get('/user/scheme'),

  // POST /user/applications/{id}/scores  body: { totalScore, comment }
  saveScores: (appId, totalScore, comment) =>
    API.post(`/user/applications/${appId}/scores`, { totalScore, comment }),

  getRanked: (sortField, sortDir) =>
    API.get(`/user/ranked?sortField=${sortField || 'totalScore'}&sortDir=${sortDir || 'desc'}`),

  // PUT /user/applications/{id}/flag  body: { color, reason }
  toggleFlag: (appId, color, reason) =>
    API.put(`/user/applications/${appId}/flag`, { color, reason }),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:            ()             => API.get('/admin/stats'),
  getAllApplications:   (cat, status) => {
    const p = new URLSearchParams();
    if (cat)    p.append('category', cat);
    if (status) p.append('status',   status);
    return API.get(`/admin/applications?${p}`);
  },
  getRankedByCategory: (cat)          => API.get(`/admin/ranked/${cat}`),
  getFlagged:          ()             => API.get('/admin/flagged'),
  getUserProgress:     ()             => API.get('/admin/users'),
  publishResults:      (selections)   => API.post('/admin/publish-results', selections),
  overrideStatus:      (id, status)   => API.put(`/admin/applications/${id}/status`, { status }),
  setFlag:             (id, color, reason) =>
    API.put(`/admin/applications/${id}/flag`, { flagColor: color, reason }),

  // Marking scheme management (admin has same access as DC)
  getSchemesSummary: ()       => API.get('/admin/schemes/summary'),
  getActiveScheme:   (cat)    => API.get(`/admin/schemes/category/${cat}`),
  createScheme:      (category, title, criteria) =>
    API.post('/admin/schemes', { category, title, criteria }),
  addCriterion:      (schemeId, criterion) =>
    API.post(`/admin/schemes/${schemeId}/criteria`, criterion),
  removeCriterion:   (criterionId) => API.delete(`/admin/criteria/${criterionId}`),
};

// ── REPORT ────────────────────────────────────────────────────────────────────
export const reportApi = {
  getFields:     ()     => API.get('/report/fields'),
  generateUser:  (body) => API.post('/report/user',  body),
  generateAdmin: (body) => API.post('/report/admin', body),
};