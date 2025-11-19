// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../auth/useAuth.jsx';
import { getToken } from '../api/api.js';

export default function AdminRoute({ children }) {
  const { user, loadingAuth } = useAuth() || {};
  const token = getToken();

  if (loadingAuth) return <div className="flex items-center justify-center h-40">Loading...</div>;

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
