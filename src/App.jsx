
// import React from 'react';
// import { Routes, Route, Link, Navigate } from 'react-router-dom';
// import Register from './pages/Register';
// import Login from './pages/Login';
// import Plans from './pages/Plans';
// import Checkout from './pages/Checkout';
// import Dashboard from './pages/Dashboard';
// import { getToken, logout } from './api/api.js';
// import ProtectedRoute from './components/ProtectedRoute.jsx';
// import PublicRoute from './components/PublicRoute.jsx';
// import './index.css';

// export default function App() {
//   const token = getToken();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center gap-4">
//               <Link to="/plans" className="text-2xl font-semibold text-indigo-600">Prydan</Link>
//               <nav className="hidden sm:flex gap-3 text-sm">
//                 <Link to="/plans" className="text-gray-600 hover:text-indigo-600">Plans</Link>
//                 <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</Link>
//               </nav>
//             </div>

//             <div className="flex items-center gap-3">
//               {!token ? (
//                 <>
//                   <Link to="/register" className="px-4 py-2 rounded-md text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Register</Link>
//                   <Link to="/login" className="px-4 py-2 rounded-md text-sm border border-indigo-200 hover:bg-indigo-50">Login</Link>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-sm text-gray-600 hidden sm:inline">Signed in</span>
//                   <button
//                     onClick={() => { logout(); window.location.href = '/login'; }}
//                     className="px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm"
//                   >
//                     Logout
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Routes>
//           <Route path="/" element={<Navigate to="/plans" replace />} />

//           <Route
//             path="/register"
//             element={
//               <PublicRoute>
//                 <Register />
//               </PublicRoute>
//             }
//           />

//           <Route
//             path="/login"
//             element={
//               <PublicRoute>
//                 <Login />
//               </PublicRoute>
//             }
//           />

//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/plans"
//             element={
//               <ProtectedRoute>
//                 <Plans />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/checkout/:planId"
//             element={
//               <ProtectedRoute>
//                 <Checkout />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>
//     </div>
//   );
// }





// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Plans from './pages/Plans.jsx';
import Checkout from './pages/Checkout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Layout from './components/Layout.jsx';
import './index.css';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/plans" replace />} />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/:planId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Admin panel (client-side guard only; server enforces) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
