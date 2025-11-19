// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api.js';

export default function AdminPanel() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/subscriptions'); // admin route
      setSubs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
      alert(err.response?.data?.message || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Admin — Subscriptions</h1>
      {loading ? <div>Loading…</div> : (
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="p-2">#</th>
                <th className="p-2">User</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Status</th>
                <th className="p-2">Start</th>
                <th className="p-2">End</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s._id} className="border-t">
                  <td className="p-2">{s._id.slice(-6)}</td>
                  <td className="p-2">{s.user?.email || s.user}</td>
                  <td className="p-2">{s.plan?.name || '-'}</td>
                  <td className="p-2">{s.status}</td>
                  <td className="p-2">{new Date(s.startDate).toLocaleString()}</td>
                  <td className="p-2">{new Date(s.endDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
