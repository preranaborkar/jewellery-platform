// jewelry-ecommerce/frontend/src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
// defined state and add validation  and fetch data from services
export const useLogin = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
       
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Handle URL parameters (for error messages from OAuth)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear errors when user starts typing
        if (error) setError('');
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await authService.login(form);
            
            if (result.success) {
                const userData = login(result.data, result.data.token);
                
                // Handle role-based routing here
                if (userData.role === 'admin') {
                    navigate('/admindashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = authService.getErrorMessage(err.status, err.data);
            setError(errorMessage);
        }

        setLoading(false);
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleGoogleLogin = () => {
        authService.handleGoogleLogin();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return {
        form,
        loading,
        error,
        showPassword,
        validationErrors,
        handleChange,
        handleSubmit,
        handleForgotPassword,
        handleGoogleLogin,
        togglePasswordVisibility
    };
};

export const useRegister = () => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    
    const navigate = useNavigate();
    const location = useLocation();
    const { handleRegistrationSuccess } = useAuth();

    // Handle URL parameters (for error messages from OAuth)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [location]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm(prev => ({
            ...prev,
            [id]: value
        }));

        // Clear errors when user starts typing
        if (error) setError('');
        if (validationErrors[id]) {
            setValidationErrors(prev => ({
                ...prev,
                [id]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // First name validation
        if (!form.firstName.trim()) {
            errors.firstName = 'First name is required';
        }
        
        // Last name validation
        if (!form.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(form.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!form.password) {
            errors.password = 'Password is required';
        } else if (!passwordRegex.test(form.password)) {
            errors.password = 'Password must contain uppercase, lowercase, number and be 6+ characters';
        }
        
        // Phone validation (optional, but if provided should be valid)
        if (form.phone && form.phone.trim()) {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(form.phone)) {
                errors.phone = 'Please enter a valid phone number';
            }
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Client-side validation
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const result = await authService.register(form);
            
            if (result.success) {
                // Handle successful registration
                const userData = handleRegistrationSuccess(result.data);
                
                // Show success message
                alert('Registration successful! Please check your email for OTP verification.');
                
                // Navigate to OTP verification page
                navigate('/verify-otp', { 
                    state: { 
                        email: form.email,
                        message: userData.message 
                    } 
                });
            }
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = authService.getRegisterErrorMessage(err.status, err.data);
            setError(errorMessage);
        }

        setLoading(false);
    };

    const handleGoogleRegister = () => {
        authService.handleGoogleRegister();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    return {
        form,
        loading,
        error,
        showPassword,
        validationErrors,
        handleChange,
        handleSubmit,
        handleGoogleRegister,
        togglePasswordVisibility,
        navigateToLogin,
    };
};

// Move useVerifyOTP outside and export it
export const useVerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [email, setEmail] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const { completeRegistration } = useAuth();

    useEffect(() => {
        const emailFromLocation = location.state?.email;
        if (emailFromLocation) {
            setEmail(emailFromLocation);
            localStorage.setItem('verificationEmail', emailFromLocation);
        } else {
            const storedEmail = localStorage.getItem('verificationEmail');
            if (storedEmail) {
                setEmail(storedEmail);
            }
        }
    }, [location]);

    // Handle cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (error) setError('');
    };

    const handleSubmit = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await authService.verifyOTP(email, otpString);
            
            if (result.success) {
                localStorage.removeItem('verificationEmail');
                alert('Email verified successfully! Welcome to SváRIN!');
                navigate('/login');
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            const errorMessage = authService.getErrorMessage(err.status, err.data);
            setError(errorMessage);
        }

        setLoading(false);
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError('');

        try {
            const result = await authService.resendOTP(email);
            
            if (result.success) {
                alert('New OTP sent to your email!');
                setOtp(['', '', '', '', '', '']);
                setResendCooldown(60);
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            const errorMessage = authService.getErrorMessage(err.status, err.data);
            setError(errorMessage);
        }

        setResendLoading(false);
    };

    const maskEmail = (email) => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        const maskedLocal = localPart.charAt(0) + '*'.repeat(Math.max(0, localPart.length - 2)) + localPart.slice(-1);
        return `${maskedLocal}@${domain}`;
    };

    const navigateToRegister = () => {
        navigate('/register');
    };

    return {
        otp,
        setOtp,
        loading,
        error,
        resendLoading,
        resendCooldown,
        email,
        handleOtpChange,
        handleSubmit,
        handleResendOTP,
        maskEmail,
        navigateToRegister
    };
};

export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { setPasswordResetToken } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await authService.forgotPassword(email);
            
            if (result.success) {
                // Store reset token in context
                if (result.data.data?.resetToken) {
                    setPasswordResetToken(result.data.data?.resetToken);
                }
                
                // Navigate to reset password page
                navigate('/reset-password', { 
                    state: { 
                        email,
                        resetToken: result.data.data?.resetToken 
                    } 
                });
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            const errorMessage = authService.getErrorMessage(err.status, err.data);
            setError(errorMessage);
        }

        setLoading(false);
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    return {
        email,
        setEmail,
        loading,
        error,
        setError,
        handleSubmit,
        navigateToLogin
    };
};


export const useGetProfileData = () => {
    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const fetchProfileData = async () => {

        if (!user || !user.userId) {
            setError('User not authenticated');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await authService.getProfileData(user.userId);
            setProfileData(response.data.data);
            console.log('Profile data fetched:', response.data.data);
        }
        catch (err) {
            console.error('Error fetching profile data:', err);
            const errorMessage = authService.getErrorMessage(err.status, err.data);
            setError(errorMessage);
            if (err.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }


    };

    useEffect(() => {
        if (user && user.userId) {
            fetchProfileData();
        }
    }, [user]);

    return {
        profileData,
        loading,
        error,
        fetchProfileData
    };
};


export const useResetPassword = () => {
    const [form, setForm] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const { clearResetToken } = useAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const tokenFromState = location.state?.resetToken;
        
        console.log('Reset Password - Token from URL:', tokenFromUrl);
        console.log('Reset Password - Token from State:', tokenFromState);
        console.log('Reset Password - Location State:', location.state);

        if (tokenFromUrl) {
            setResetToken(tokenFromUrl);
        } else if (tokenFromState) {
            setResetToken(tokenFromState);
        } else {
            setError('No reset token found. Please request a new password reset.');
            setTimeout(() => {
                navigate('/forgot-password');
            }, 3000);
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (error) setError('');
    };

    const validateForm = () => {
        if (!form.otp) {
            setError('OTP is required');
            return false;
        }

        if (form.otp.length !== 6) {
            setError('OTP must be 6 digits');
            return false;
        }

        if (!form.newPassword) {
            setError('New password is required');
            return false;
        }

        if (form.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
            return false;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!resetToken) {
            setError('Reset token is missing. Please request a new password reset.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await authService.resetPassword(resetToken, form.otp, form.newPassword);
            
            if (result.success) {
                setSuccess(true);
                clearResetToken();
                
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            console.error('Reset password error:', err);
            const errorMessage = authService.getErrorMessage(err.status, err.data);
            setError(errorMessage);
        }

        setLoading(false);
    };

    const navigateToForgotPassword = () => {
        navigate('/forgot-password');
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return {
        form,
        loading,
        error,
        success,
        showPassword,
        showConfirmPassword,
        resetToken,
        handleChange,
        validateForm,
        handleSubmit,
        navigateToForgotPassword,  
        navigateToLogin,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility
    };
};