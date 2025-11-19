
import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import { Link } from 'react-router-dom';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/plans');
        setPlans(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load plans. Try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Choose a plan</h1>
        <p className="mt-2 text-sm text-gray-600">Pick a plan that fits your needs. Pricing shown in INR.</p>
      </header>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-pulse px-6 py-3 rounded bg-gray-100">Loading plans…</div>
        </div>
      )}

      {error && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan._id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{plan.formattedPrice ?? `₹${plan.price}`}</div>
                  <div className="text-xs text-gray-500">for {plan.duration} days</div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 flex-1">
                {(plan.features || []).slice(0, 5).join(' • ') || 'No details provided.'}
              </p>

              <ul className="mt-4 mb-6 space-y-1 text-sm text-gray-700">
                {(plan.features || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="inline-block mt-0.5 h-2 w-2 bg-indigo-400 rounded-full" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex gap-3">
                <Link
                  to={`/checkout/${plan._id}`}
                  className="flex-1 text-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  Choose
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
