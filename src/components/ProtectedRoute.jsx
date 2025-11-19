
// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../api/api.js';
import useAuth from '../auth/useAuth.jsx';

export default function ProtectedRoute({ children }) {
  const token = getToken();
  const { user, loadingAuth } = useAuth() || {};
  const location = useLocation();

  // If auth is still loading, show placeholder
  if (loadingAuth) {
    return <div className="flex items-center justify-center h-40">Loading...</div>;
  }

  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
