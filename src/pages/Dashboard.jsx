
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api.js';
import { useNavigate } from 'react-router-dom';
import { downloadInvoice } from '../utils/download.js';

/* Utility to load Razorpay SDK */
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
    document.body.appendChild(s);
  });
}

export default function Dashboard() {
  const [data, setData] = useState({ user: null, activeSubscription: null, payments: [] });
  const [loading, setLoading] = useState(true);
  const [payBusy, setPayBusy] = useState(false);
  const navigate = useNavigate();

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/me');
      const payload = res.data.data || {};
      setData({
        user: payload.user || null,
        activeSubscription: payload.activeSubscription || null,
        payments: payload.payments || [],
      });
    } catch (err) {
      console.error(err);
      alert('Failed to fetch profile. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const startRazorpayFromPayment = async (orderResponse) => {
    const { orderId, amount, currency, key, paymentId } = orderResponse;
    await loadRazorpayScript();
    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount,
        currency,
        name: 'Prydan',
        description: 'Subscription action',
        order_id: orderId,
        handler: async function (response) {
          try {
            const payload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            };
            await api.post('/api/payments/verify', payload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          email: (JSON.parse(localStorage.getItem('user') || '{}').email) || '',
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        reject(new Error(resp.error?.description || 'Payment failed'));
      });
      rzp.open();
    });
  };

  const handleRenew = async () => {
    if (!data.activeSubscription) return alert('No active subscription to renew.');
    setPayBusy(true);
    try {
      const body = {
        planId: data.activeSubscription.plan._id,
        action: 'renew',
        subscriptionId: data.activeSubscription._id,
      };
      const res = await api.post('/api/payments/create-order', body);
      const orderData = res.data.data;
      await startRazorpayFromPayment(orderData);
      alert('Renewal successful');
      await refresh();
    } catch (err) {
      console.error('Renew failed', err);
      alert(err.response?.data?.message || err.message || 'Renew failed');
    } finally {
      setPayBusy(false);
    }
  };

  const handleUpgrade = (newPlanId) => {
    // Navigate to checkout and pass action=upgrade and subscriptionId in state
    navigate(`/checkout/${newPlanId}`, { state: { action: 'upgrade', subscriptionId: data.activeSubscription?._id } });
  };

  const handleDownload = async (paymentId) => {
    try {
      await downloadInvoice(paymentId);
    } catch (err) {
      console.error('Download invoice failed', err);
      alert(err.response?.data?.message || err.message || 'Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const { user, activeSubscription, payments } = data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Profile card */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <div className="text-sm text-gray-700">Name: <span className="font-medium">{user?.name}</span></div>
        <div className="text-sm text-gray-700">Email: <span className="font-medium">{user?.email}</span></div>
      </div>

      {/* Active subscription */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Active Subscription</h2>

        {activeSubscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-2">
              <div className="text-sm">Plan: <span className="font-medium">{activeSubscription.plan?.name}</span></div>
              <div className="text-sm">Start: <span className="font-medium">{new Date(activeSubscription.startDate).toLocaleString()}</span></div>
              <div className="text-sm">End: <span className="font-medium">{new Date(activeSubscription.endDate).toLocaleString()}</span></div>
              <div className="text-sm">Status: <span className="font-medium">{activeSubscription.status}</span></div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRenew}
                disabled={payBusy}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
              >
                {payBusy ? 'Processing...' : 'Renew'}
              </button>

              <div className="text-sm text-gray-600 text-center">Or upgrade to a higher plan below</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No active subscription</div>
        )}
      </div>

      {/* Payments */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Recent Payments</h2>
        <div className="space-y-2 text-sm text-gray-700">
          {(!payments || payments.length === 0) && <div>No payments yet</div>}
          {(payments || []).map(p => (
            <div key={p._id} className="flex justify-between items-center border-b py-3">
              <div>
                <div className="font-medium">{p.receipt}</div>
                <div className="text-xs text-gray-500">{p.formattedAmount ?? `₹${(p.amount / 100).toFixed(2)}`}</div>
                <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-sm ${p.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>{p.status}</div>

                {p.status === 'completed' && (
                  <button
                    onClick={() => handleDownload(p._id)}
                    className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded"
                  >
                    Download Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade section */}
      <UpgradeSection currentPlanId={activeSubscription?.plan?._id} onUpgrade={handleUpgrade} />
    </div>
  );
}

/* UpgradeSection component */
function UpgradeSection({ currentPlanId, onUpgrade }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/plans');
        setPlans(res.data.data || []);
      } catch (err) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;
  if (!plans || plans.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Available Upgrades</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = String(p._id) === String(currentPlanId);
          return (
            <div key={p._id} className={`p-4 border rounded-lg flex flex-col justify-between ${isCurrent ? 'opacity-70' : ''}`}>
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.formattedPrice ?? `₹${p.price}`}</div>
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {(p.features || []).slice(0, 4).map((f, i) => <li key={i}>• {f}</li>)}
                </ul>
              </div>
              <div className="mt-4">
                <button
                  disabled={isCurrent}
                  onClick={() => onUpgrade(p._id)}
                  className={`w-full px-3 py-2 rounded text-sm ${isCurrent ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  {isCurrent ? 'Current' : `Upgrade to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
