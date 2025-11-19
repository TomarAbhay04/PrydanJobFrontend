// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../api/api.js';

/**
 * Prevent logged-in users from visiting auth pages (register/login).
 * Usage: <Route path="/login" element={<PublicRoute><Login/></PublicRoute>} />
 */
export default function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const token = getToken();

  // If user is already authenticated, redirect them to dashboard (or custom path)
  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Not authenticated → render child (login/register)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        {children}
      </div>
    </div>
  );
}
