import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor to inject JWT token into Admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('galo_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('galo_admin_token')) {
        localStorage.removeItem('galo_admin_token');
        localStorage.removeItem('galo_admin_user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export const candidateService = {
  apply: async (formData) => {
    const response = await api.post('/candidates/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getCandidates: async (params = {}) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  approveCandidate: async (id) => {
    const response = await api.put(`/candidates/${id}/approve`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/candidates/${id}/status`, { status });
    return response.data;
  }
};

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('galo_admin_token', response.data.token);
      localStorage.setItem('galo_admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('galo_admin_token');
    localStorage.removeItem('galo_admin_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('galo_admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('galo_admin_token');
  }
};

export default api;
