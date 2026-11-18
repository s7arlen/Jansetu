import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token into every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jansetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear stale tokens on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('jansetu_token')) {
        localStorage.removeItem('jansetu_token');
        localStorage.removeItem('jansetu_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
