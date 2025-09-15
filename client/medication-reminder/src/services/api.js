import axios from 'axios';

var process = { env: {} }; // Temporary fix for process.env in some environments

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5500/api',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, phone) => api.post('/auth/register', { name, email, password, phone }),
  getMe: () => api.get('/auth/me'),
};

// Medication endpoints
export const medicationApi = {
  getAll: () => api.get('/medications'),
  getById: (id) => api.get(`/medications/${id}`),
  create: (medicationData) => api.post('/medications', medicationData),
  update: (id, medicationData) => api.put(`/medications/${id}`, medicationData),
  delete: (id) => api.delete(`/medications/${id}`),
};

export default api;