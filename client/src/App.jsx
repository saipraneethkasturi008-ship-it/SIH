import React, { useCallback, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import { LanguageProvider } from './context/LanguageContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BusinessProvider } from './context/BusinessContext.jsx';

import AppLayout from './components/layout/AppLayout.jsx';
import AuthLayout from './components/layout/AuthLayout.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BusinessDiscovery from './pages/BusinessDiscovery.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Assistant from './pages/Assistant.jsx';
import Calculator from './pages/Calculator.jsx';
import Sales from './pages/Sales.jsx';
import Expenses from './pages/Expenses.jsx';
import Products from './pages/Products.jsx';
import Marketing from './pages/Marketing.jsx';
import Schemes from './pages/Schemes.jsx';
import Profile from './pages/Profile.jsx';
import BusinessOpportunity from './pages/BusinessOpportunity.jsx';

import LogoIntro from './components/common/LogoIntro.jsx';


/* ============================================================
   PROTECTED ROUTE
   ============================================================ */

function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('vm_token');

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}


/* ============================================================
   APP
   ============================================================ */

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const completeIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <LanguageProvider>

      {showIntro && (
        <LogoIntro onComplete={completeIntro} />
      )}

      <AuthProvider>
        <BusinessProvider>

          <Routes>

            {/* ==================================================
                PUBLIC ROUTES
                ================================================== */}

            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
            </Route>


            {/* ==================================================
                AUTH ROUTES
                ================================================== */}

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>


            {/* ==================================================
                PROTECTED ROUTES
                ================================================== */}

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>

                <Route
                  path="/business-discovery"
                  element={<BusinessDiscovery />}
                />

                <Route
                  path="/business-opportunity"
                  element={<BusinessOpportunity />}
                />

                <Route
                  path="/onboarding"
                  element={<Onboarding />}
                />

                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                <Route
                  path="/assistant"
                  element={<Assistant />}
                />

                <Route
                  path="/calculator"
                  element={<Calculator />}
                />

                <Route
                  path="/sales"
                  element={<Sales />}
                />

                <Route
                  path="/expenses"
                  element={<Expenses />}
                />

                <Route
                  path="/products"
                  element={<Products />}
                />

                <Route
                  path="/marketing"
                  element={<Marketing />}
                />

                <Route
                  path="/schemes"
                  element={<Schemes />}
                />

                <Route
                  path="/profile"
                  element={<Profile />}
                />

              </Route>
            </Route>


            {/* ==================================================
                FALLBACK
                ================================================== */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </BusinessProvider>
      </AuthProvider>

    </LanguageProvider>
  );
}

export default App;