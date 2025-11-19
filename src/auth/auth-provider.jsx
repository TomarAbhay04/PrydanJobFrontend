// // src/auth/auth-provider.js
// import React, { createContext, useEffect, useState } from 'react';
// import api from '../api/api';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loadingAuth, setLoadingAuth] = useState(true);

//   useEffect(() => {
//     const init = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setLoadingAuth(false);
//         return;
//       }
//       try {
//         const res = await api.get('/auth/me');
//         // API returns { data: { user, activeSubscription } }
//         const u = res.data?.data?.user ?? res.data?.data;
//         setUser(u);
//       } catch (err) {
//         localStorage.removeItem('token');
//         setUser(null);
//       } finally {
//         setLoadingAuth(false);
//       }
//     };
//     init();
//   }, []);

//   const register = async ({ name, email, password }) => {
//     const res = await api.post('/auth/register', { name, email, password });
//     if (res.data?.token) {
//       localStorage.setItem('token', res.data.token);
//     }
//     const u = res.data?.user ?? res.data?.data;
//     setUser(u);
//     return res;
//   };

//   const login = async ({ email, password }) => {
//     const res = await api.post('/auth/login', { email, password });
//     if (res.data?.token) {
//       localStorage.setItem('token', res.data.token);
//     }
//     const u = res.data?.user ?? res.data?.data;
//     setUser(u);
//     return res;
//   };

//   const logout = async () => {
//     try {
//       await api.post('/auth/logout');
//     } catch (err) {}
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loadingAuth, register, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };













// src/auth/auth-provider.jsx
import React, { createContext, useEffect, useState } from 'react';
import api, { setToken, getToken, removeToken } from '../api/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoadingAuth(false);
      return null;
    }
    try {
      const res = await api.get('/api/auth/me'); // backend route
      const payload = res.data?.data || {};
      const u = payload.user || payload;
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    } catch (err) {
      // token invalid or expired
      removeToken();
      localStorage.removeItem('user');
      setUser(null);
      return null;
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async ({ name, email, password }) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    const { token, user: u } = res.data;
    if (token) setToken(token);
    if (u) setUser(u) && localStorage.setItem('user', JSON.stringify(u));
    return res;
  };

  const login = async ({ email, password }) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user: u } = res.data;
    if (token) setToken(token);
    if (u) {
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      // fall back to refreshUser
      await refreshUser();
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // ignore
    }
    removeToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loadingAuth, refreshUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
