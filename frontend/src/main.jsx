import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import AdminDashboard from './pages/admin/AdminDashboard';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import RiderDashboard from './pages/rider/RiderDashboard';
import StoreDashboard from './pages/store/StoreDashboard';
import UserDashboard from './pages/user/UserDashboard';

const AppRoutes = () => {
    const { user } = useAuth();

    // Redirect logged-in users to their dashboard
    const getDefaultRoute = () => {
        if (!user) return '/';

        switch (user.role) {
            case 'USER':
                return '/user/dashboard';
            case 'STORE':
                return '/store/dashboard';
            case 'RIDER':
                return '/rider/dashboard';
            case 'ADMIN':
                return '/admin/dashboard';
            default:
                return '/';
        }
    };

    return (
        <Routes>
            <Route
                path="/"
                element={user ? <Navigate to={getDefaultRoute()} replace /> : <Login />}
            />

            {/* User Routes */}
            <Route
                path="/user/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Store Routes */}
            <Route
                path="/store/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['STORE']}>
                        <StoreDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Rider Routes */}
            <Route
                path="/rider/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['RIDER']}>
                        <RiderDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Coming Soon Page */}
            <Route path="/coming-soon" element={<ComingSoon />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <Toaster position="top-right" />
            </AuthProvider>
        </BrowserRouter>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
