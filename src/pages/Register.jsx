
import React, { useState } from 'react';
import api, { setToken } from '../api/api.js';
import { Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      const { token, user } = res.data;
      if (token) {
        setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/plans';
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create an account</h2>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              disabled={busy}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={busy}
              className={`px-4 py-2 rounded-md text-white text-sm ${busy ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {busy ? 'Creating account...' : 'Create account'}
            </button>

            <Link to="/login" className="text-sm text-indigo-600 hover:underline">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
