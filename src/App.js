import './assets/css/App.css';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import SignInCentered from './views/auth/signIn';


// PrivateRoute for protected routes (admin/*)
function PrivateRoute() {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

// PublicRoute for sign-in page (unauthenticated users only)
function PublicRoute() {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Outlet />;
}

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <ChakraProvider theme={currentTheme}>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />
        {/* Protect admin routes */}
        <Route element={<PrivateRoute />}>
          <Route
            path="admin/*"
            element={
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
        </Route>
        {/* Restrict sign-in to unauthenticated users */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<SignInCentered />} />
          <Route path="/auth/sign-in" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ChakraProvider>
  );
}
