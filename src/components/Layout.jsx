// src/components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../auth/useAuth.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth() || {};
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link to="/plans" className="text-2xl font-semibold text-indigo-600">Prydan</Link>
              <nav className="hidden sm:flex gap-3 text-sm">
                <Link to="/plans" className="text-gray-600 hover:text-indigo-600">Plans</Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</Link>
                {user?.role === 'admin' && <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin</Link>}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Link to="/register" className="px-4 py-2 rounded-md text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Register</Link>
                  <Link to="/login" className="px-4 py-2 rounded-md text-sm border border-indigo-200 hover:bg-indigo-50">Login</Link>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">Signed in as {user.email}</span>
                  <button
                    onClick={() => { logout(); window.location.href = '/login'; }}
                    className="px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
