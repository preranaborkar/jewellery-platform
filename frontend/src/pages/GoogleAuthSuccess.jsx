import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const handleGoogleCallback = () => {
            try {
                const urlParams = new URLSearchParams(location.search);
                const token = urlParams.get('token');
                const userParam = urlParams.get('customer');

                console.log('Google Auth Success - Token:', token);
                console.log('Google Auth Success - User Param:', userParam);

                if (token && userParam) {
                    let userData;
                    try {
                        userData = JSON.parse(decodeURIComponent(userParam));
                        console.log('Parsed user data:', userData);
                    } catch (parseError) {
                        console.error('Failed to parse user data:', parseError);
                        navigate('/login?error=' + encodeURIComponent('Authentication failed. Please try again.'));
                        return;
                    }

                    // Use the login function from AuthContext
                    const loggedInUser = login(userData, token);

                    // Role-based routing
                    if (loggedInUser.role === 'admin') {
                        navigate('/admindashboard');
                    } else {
                        navigate('/');
                    }
                } else {
                    // Missing data, redirect to login with error
                    console.error('Missing token or user data');
                    navigate('/login?error=' + encodeURIComponent('Authentication failed. Please try again.'));
                }
            } catch (error) {
                console.error('Google auth callback error:', error);
                navigate('/login?error=' + encodeURIComponent('Authentication failed. Please try again.'));
            }
        };

        handleGoogleCallback();
    }, [navigate, location, login]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F]">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-[#D0B49F]/20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#A47551] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-[#523A28] mb-2">Completing Sign In...</h2>
                    <p className="text-[#A47551]">Please wait while we set up your account.</p>
                </div>
            </div>
        </div>
    );
};

export default GoogleAuthSuccess;