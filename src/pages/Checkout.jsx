
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api.js';

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

export default function Checkout() {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const action = state.action || 'purchase'; // purchase | renew | upgrade
  const subscriptionId = state.subscriptionId || null;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/plans/${planId}`);
        setPlan(res.data.data);
      } catch (err) {
        alert('Plan not found');
        navigate('/plans');
      }
    })();
  }, [planId]);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const body = { planId, action };
      if (action === 'renew' || action === 'upgrade') {
        if (!subscriptionId) {
          alert('subscriptionId required for renew/upgrade');
          setLoading(false);
          return;
        }
        body.subscriptionId = subscriptionId;
      }

      const res = await api.post('/api/payments/create-order', body);
      const { orderId, amount, currency, key, paymentId } = res.data.data;

      await loadRazorpayScript();

      const options = {
        key,
        amount,
        currency,
        name: 'Your SaaS',
        description: `${action === 'purchase' ? 'Purchase' : action} — ${plan?.name}`,
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
            alert('Payment successful');
            navigate('/dashboard');
          } catch (err) {
            console.error('Verification failed', err);
            alert('Payment verification failed: ' + (err.response?.data?.message || err.message));
          }
        },
        prefill: {
          email: (JSON.parse(localStorage.getItem('user') || '{}').email) || '',
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error('payment.failed', resp);
        alert('Payment failed: ' + (resp.error?.description || 'unknown'));
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return <div>Loading plan...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-2">{action === 'purchase' ? 'Checkout' : action === 'renew' ? 'Renew subscription' : 'Upgrade plan'}</h2>
      <div className="text-gray-600 mb-4">Plan: <span className="font-medium">{plan.name}</span></div>

      <div className="flex items-baseline gap-4">
        <div className="text-3xl font-bold">{plan.formattedPrice ?? `₹${plan.price}`}</div>
        <div className="text-sm text-gray-500">{plan.duration} days</div>
      </div>

      <ul className="mt-4 space-y-2 text-gray-600">
        {plan.features?.map((f, i) => <li key={i}>• {f}</li>)}
      </ul>

      <div className="mt-6">
        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Processing...' : action === 'purchase' ? 'Pay & Subscribe' : action === 'renew' ? 'Pay & Renew' : 'Pay & Upgrade'}
        </button>
      </div>
    </div>
  );
}
