// src/components/UpgradeModal.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import PaymentButton from './PaymentButton.jsx';

export default function UpgradeModal({ open, onClose, onUpgradeSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/plans');
        setPlans(res.data.data || []);
      } catch (err) {
        console.error(err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upgrade Plan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <div className="mt-4">
          {loading && <div className="text-sm text-gray-500">Loading plans…</div>}
          {!loading && plans.length === 0 && <div className="text-sm text-gray-500">No plans available</div>}
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
            {plans.map(p => (
              <div key={p._id} className="border rounded p-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.duration} days</div>
                  </div>
                  <div className="text-indigo-600 font-bold">{p.formattedPrice ?? `₹${p.price}`}</div>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex-1">{(p.features || []).slice(0,3).join(' • ')}</div>
                <div className="mt-3">
                  <PaymentButton
                    planId={p._id}
                    label={`Upgrade to ${p.name}`}
                    onSuccess={(sub) => {
                      onUpgradeSuccess(sub);
                      onClose();
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
