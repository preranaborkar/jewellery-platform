// jewelry-ecommerce/frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [registrationData, setRegistrationData] = useState(null); // For storing registration data temporarily
    const [resetToken, setResetToken] = useState(null); // For password reset flow

    // Check if user is already logged in on app start
    useEffect(() => {
        const userData = localStorage.getItem('customer');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
            try {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                // Clear corrupted data
                localStorage.removeItem('customer');
                localStorage.removeItem('token');
            }
        }

        // Check for stored reset token
        const storedResetToken = localStorage.getItem('resetToken');
        if (storedResetToken) {
            setResetToken(storedResetToken);
        }
    }, []);

    const login = (userData, token) => {
        // Store user data in localStorage for frontend access
        const userInfo = {
            userId: userData.userId,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            isVerified: userData.isVerified,
            avatar: userData.avatar
        };

        localStorage.setItem('customer', JSON.stringify(userInfo));
        localStorage.setItem('token', token);
        
        setUser(userInfo);
        setIsAuthenticated(true);

        // Clear any registration data on successful login
        setRegistrationData(null);

        // Return user data to handle navigation in the component
        return userInfo;
    };

    const logout = () => {
        localStorage.removeItem('customer');
        localStorage.removeItem('token');
        localStorage.removeItem('resetToken');
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('verificationEmail');
        
        setUser(null);
        setIsAuthenticated(false);
        setRegistrationData(null);
        setResetToken(null);
    };

    // Store registration data temporarily (for OTP verification flow)
    const setTempRegistrationData = (data) => {
        setRegistrationData(data);
    };

    // Clear temporary registration data
    const clearRegistrationData = () => {
        setRegistrationData(null);
    };

    // Handle successful registration (when email verification is required)
    const handleRegistrationSuccess = (userData) => {
        // Store registration data temporarily for OTP verification
        setTempRegistrationData({
            email: userData.email,
            message: userData.message || 'Registration successful! Please check your email for OTP verification.'
        });
        
        return userData;
    };

    // Complete registration after OTP verification
    const completeRegistration = (userData, token) => {
        // Clear temporary registration data
        clearRegistrationData();
        
        // Use the same login function to set user data
        return login(userData, token);
    };

    // Store reset token for password reset flow
    const setPasswordResetToken = (token) => {
        setResetToken(token);
        // Also store in localStorage as backup
        if (token) {
            localStorage.setItem('resetToken', token);
        } else {
            localStorage.removeItem('resetToken');
        }
    };

    // Clear reset token
    const clearResetToken = () => {
        setResetToken(null);
        localStorage.removeItem('resetToken');
        localStorage.removeItem('resetEmail');
    };

    const isAdmin = () => {
        return isAuthenticated && user?.role === 'admin';
    };

    
    const value = {
        user,
        isAuthenticated,
        isAdmin,
        registrationData,
        resetToken,
        login,
        logout,
        setTempRegistrationData,
        clearRegistrationData,
        handleRegistrationSuccess,
        completeRegistration,
        setPasswordResetToken,
        clearResetToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};