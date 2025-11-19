// // src/components/PaymentButton.jsx
// import React, { useState } from 'react';
// import api from '../api/api.js';

// async function loadRazorpayScript() {
//   if (window.Razorpay) return true;
//   return new Promise((resolve, reject) => {
//     const s = document.createElement('script');
//     s.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     s.onload = () => resolve(true);
//     s.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
//     document.body.appendChild(s);
//   });
// }

// /**
//  * PaymentButton
//  * props:
//  *  - planId  (required)
//  *  - label   (button text)
//  *  - onSuccess(subscription)  called after verification + subscription creation
//  *  - className (optional)
//  */
// export default function PaymentButton({ planId, label = 'Pay & Activate', onSuccess = () => {}, className = '' }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleClick = async () => {
//     setError('');
//     setLoading(true);
//     try {
//       // create order on server
//       const res = await api.post('/api/payments/create-order', { planId });
//       const { orderId, amount, currency, key, paymentId } = res.data.data;

//       await loadRazorpayScript();

//       const rzpOptions = {
//         key,
//         amount,
//         currency,
//         name: 'Your SaaS Name',
//         description: 'Subscription purchase',
//         order_id: orderId,
//         handler: async function (response) {
//           try {
//             const payload = {
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature,
//               paymentId,
//             };
//             // verify on server
//             const verify = await api.post('/api/payments/verify', payload);
//             // success: server returns subscription in response.data.data.subscription (or data)
//             const subscription = verify.data.data?.subscription ?? verify.data.data;
//             onSuccess(subscription);
//           } catch (err) {
//             console.error('Verification failed', err);
//             setError(err.response?.data?.message || err.message || 'Verification failed');
//           }
//         },
//         prefill: {
//           email: (JSON.parse(localStorage.getItem('user') || '{}').email) || '',
//         },
//         theme: { color: '#6366f1' },
//       };

//       const rzp = new window.Razorpay(rzpOptions);
//       rzp.on('payment.failed', function (resp) {
//         console.error('payment.failed', resp);
//         setError(resp.error?.description || 'Payment failed');
//       });
//       rzp.open();
//     } catch (err) {
//       console.error('create-order error', err);
//       setError(err.response?.data?.message || err.message || 'Failed to create order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-start">
//       <button
//         onClick={handleClick}
//         disabled={loading}
//         className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 ${className}`}
//       >
//         {loading ? 'Processing…' : label}
//       </button>
//       {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
//     </div>
//   );
// }




// src/components/PaymentButton.jsx
import React, { useState } from 'react';
import api from '../api/api.js';

async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
    document.body.appendChild(s);
  });
}

export default function PaymentButton({ planId, label = 'Pay & Activate', onSuccess = () => {}, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/payments/create-order', { planId });
      const { orderId, amount, currency, key, paymentId } = res.data.data;

      await loadRazorpayScript();

      const rzpOptions = {
        key,
        amount,
        currency,
        name: 'Prydan',
        description: 'Subscription purchase',
        order_id: orderId,
        handler: async function (response) {
          try {
            const payload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            };
            const verify = await api.post('/api/payments/verify', payload);
            const subscription = verify.data.data?.subscription ?? verify.data.data;
            onSuccess(subscription, verify.data.data?.payment ?? null);
          } catch (err) {
            console.error('Verification failed', err);
            setError(err.response?.data?.message || err.message || 'Verification failed');
          }
        },
        prefill: {
          email: (JSON.parse(localStorage.getItem('user') || '{}').email) || '',
        },
        theme: { color: '#6366f1' },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (resp) {
        console.error('payment.failed', resp);
        setError(resp.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (err) {
      console.error('create-order error', err);
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 ${className}`}
      >
        {loading ? 'Processing…' : label}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
