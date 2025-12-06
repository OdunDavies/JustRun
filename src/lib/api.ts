import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('justrun_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('justrun_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },
  register: async (username: string, password: string) => {
    const response = await api.post('/api/register', { username, password });
    return response.data;
  },
};

// Profile endpoints
export const profileAPI = {
  get: async () => {
    const response = await api.get('/api/profile');
    return response.data;
  },
  update: async (data: { bio?: string; avatar?: string }) => {
    const response = await api.put('/api/profile', data);
    return response.data;
  },
};

// Jogs endpoints
export const jogsAPI = {
  save: async (route: { lat: number; lng: number }[]) => {
    const response = await api.post('/api/jogs', { route });
    return response.data;
  },
};

// Daily stats endpoint
export const statsAPI = {
  getDaily: async () => {
    const response = await api.get('/api/daily');
    return response.data;
  },
};

// Leaderboard endpoints
export const leaderboardAPI = {
  getGlobal: async () => {
    const response = await api.get('/api/leaderboard/global');
    return response.data;
  },
  createCustom: async (name: string, members: string[]) => {
    const response = await api.post('/api/leaderboard/custom', { name, members });
    return response.data;
  },
  getCustom: async (id: string) => {
    const response = await api.get(`/api/leaderboard/custom/${id}`);
    return response.data;
  },
};

export default api;
