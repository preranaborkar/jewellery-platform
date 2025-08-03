// src/pages/layout/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, user } = useAuth();
    const location = useLocation();

    // Check if we're still loading authentication state
    const token = localStorage.getItem('token');
    const customerData = localStorage.getItem('customer');
    
    // If we have tokens but user is not set yet, show loading
    if (token && customerData && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-b-transparent mx-auto mb-4" style={{ borderColor: '#523A28' }}></div>
                    <p style={{ color: '#523A28' }}>Loading...</p>
                </div>
            </div>
        );
    }

    // If no tokens and not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Check email verification
    if (user && !user.isVerified) {
        return <Navigate to="/verify-otp" replace />;
    }

    // Check admin access
    if (adminOnly && !isAdmin()) {
        return <Navigate to="/login" replace />; // or create an unauthorized page
    }

    return children;
};

export default ProtectedRoute;