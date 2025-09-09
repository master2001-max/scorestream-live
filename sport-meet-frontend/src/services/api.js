import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  // Admin users management
  adminListUsers: () => api.get('/auth/admin/users'),
  adminCreateUser: (data) => api.post('/auth/admin/users', data),
  adminUpdateUser: (id, data) => api.put(`/auth/admin/users/${id}`, data),
};

// Houses API
export const housesAPI = {
  getAll: () => api.get('/houses'),
  getById: (id) => api.get(`/houses/${id}`),
  getMembers: (id) => api.get(`/houses/${id}/members`),
  getStats: (id) => api.get(`/houses/${id}/stats`),
  create: (data) => api.post('/houses', data),
  update: (id, data) => api.put(`/houses/${id}`, data),
  delete: (id) => api.delete(`/houses/${id}`),
  updateScore: (id, score) => api.patch(`/houses/${id}/score`, { score }),
};

// Matches API
export const matchesAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  getLive: () => api.get('/matches/live'),
  getUpcoming: () => api.get('/matches/upcoming'),
  getFinished: () => api.get('/matches/finished'),
  getStats: () => api.get('/matches/stats'),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  delete: (id) => api.delete(`/matches/${id}`),
  start: (id) => api.patch(`/matches/${id}/start`),
  finish: (id) => api.patch(`/matches/${id}/finish`),
};

// Announcements API
export const announcementsAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  getRecent: () => api.get('/announcements/recent'),
  getByHouse: (houseId, params) => api.get(`/announcements/house/${houseId}`, { params }),
  getStats: () => api.get('/announcements/stats'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  toggleStatus: (id) => api.patch(`/announcements/${id}/toggle`),
};

export default api;

