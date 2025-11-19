
// src/api/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

if (!import.meta.env.VITE_API_BASE) {
  console.warn('VITE_API_BASE not set — defaulting to http://localhost:5000 (dev only).');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // we use Authorization header (JWT)
});

/* -------------------------
   Token helpers (single source)
   ------------------------- */
export const TOKEN_KEY = 'token';

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// /* Logout helper that clears user+token */
// export const logout = () => {
//   setToken(null);
//   localStorage.removeItem('user');
// };

export const logoutClientOnly = () => {
  removeToken();
  localStorage.removeItem('user');
};

/* -------------------------
   Request interceptor (attach token)
   ------------------------- */
api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* -------------------------
   Response interceptor (global 401 handling)
   ------------------------- */
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // clear token on unauthorized — UI should re-login
      removeToken();
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export default api;
