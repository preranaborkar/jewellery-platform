// jewelry-ecommerce/frontend/src/services/authService.js
class AuthService {
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                success: true,
                data: data.data
            };
        } catch (error) {
            if (error.status) {
                // HTTP error with status code
                throw error;
            } else {
                // Network error
                throw {
                    status: 0,
                    data: { message: 'Network error. Please try again.' }
                };
            }
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('Register response:', data);

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            if (error.status) {
                // HTTP error with status code
                throw error;
            } else {
                // Network error
                throw {
                    status: 0,
                    data: { message: 'Network error. Please try again.' }
                };
            }
        }
    }

    handleGoogleLogin() {
        // Use full URL to ensure it goes to backend, not React Router
        window.location.href = 'http://localhost:5000/api/auth/google';
    }

    handleGoogleRegister() {
        // Same endpoint as login, but can be used for registration context
        window.location.href = 'http://localhost:5000/api/auth/google';
    }

    // Function to handle different error responses for login
    getErrorMessage(status, data) {
        switch (status) {
            case 400:
                if (data.errors && Array.isArray(data.errors)) {
                    // Handle validation errors from server
                    return data.errors.map(err => err.msg).join(', ');
                } else if (data.message) {
                    // Check for Google OAuth specific message
                    if (data.message.includes('Google')) {
                        return data.message; // Return the exact message about Google sign-in
                    }
                    return data.message;
                } else {
                    return 'Invalid request. Please check your input.';
                }

            case 401:
                // Unauthorized - wrong credentials
                return 'Invalid email or password. Please try again.';

            case 403:
                // Forbidden - account might be locked or not verified
                if (data.message && data.message.toLowerCase().includes('verify')) {
                    return 'Please verify your email address before signing in.';
                } else if (data.message && data.message.toLowerCase().includes('lock')) {
                    return 'Your account has been locked. Please contact support.';
                } else {
                    return 'Access denied. Please contact support if this continues.';
                }

            case 404:
                // User not found
                return 'No account found with this email address.';

            case 409:
                // Conflict - for registration (user already exists)
                return 'An account with this email already exists. Please sign in instead.';

            case 429:
                // Too many requests
                return 'Too many attempts. Please try again later.';

            case 500:
                // Server error
                return 'Server error. Please try again later.';

            case 0:
                // Network error
                return 'Network error. Please try again.';

            default:
                // Generic error handling
                if (data.message) {
                    // Check for specific error messages
                    const message = data.message.toLowerCase();
                    if (message.includes('password')) {
                        return 'Incorrect password. Please try again.';
                    } else if (message.includes('email')) {
                        return 'Email address not found.';
                    } else if (message.includes('verify')) {
                        return 'Please verify your email address first.';
                    } else if (message.includes('blocked') || message.includes('banned')) {
                        return 'Your account has been suspended. Contact support.';
                    } else if (message.includes('exists')) {
                        return 'An account with this email already exists.';
                    } else {
                        return data.message;
                    }
                } else {
                    return 'Request failed. Please try again.';
                }
        }
    }

    async verifyOTP(email, otp) {
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email.trim(), otp })
            });

            const data = await response.json();
            console.log('Verify OTP response:', data);

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            if (error.status) {
                throw error;
            } else {
                throw {
                    status: 0,
                    data: { message: 'Network error. Please try again.' }
                };
            }
        }
    }

    async resendOTP(email) {
        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();
            console.log('Resend OTP response:', data);

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            if (error.status) {
                throw error;
            } else {
                throw {
                    status: 0,
                    data: { message: 'Network error. Please try again.' }
                };
            }
        }
    }

    async forgotPassword(email) {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log('Forgot password response:', data);

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            if (error.status) {
                throw error;
            } else {
                throw {
                    status: 0,
                    data: { message: 'Network error. Please try again.' }
                };
            }
        }
    }

    async resetPassword(resetToken, otp, newPassword) {
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resetToken,
                    otp,
                    newPassword
                })
            });

            const data = await response.json();
            console.log('Reset password response:', data);

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            if (error.status) {
                throw error;
            } else {
                throw {
                    status: 0,
                    data: { message: 'Network error. Please try again.' }
                };
            }
        }
    }

   async getProfileData(userId) {
    try {
        const response = await fetch(`/api/auth/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
            }
        });

        const data = await response.json();
        console.log('Profile data response:', data);

        if (!response.ok) {
            throw {
                status: response.status,
                data: data
            };
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        if (error.status) {
            throw error;
        } else {
            throw {
                status: 0,
                data: { message: 'Network error. Please try again.' }
            };
        }
    }
}
                     



    // Function to handle register-specific error responses
    getRegisterErrorMessage(status, data) {
        switch (status) {
            case 400:
                if (data.errors && Array.isArray(data.errors)) {
                    // Handle validation errors from server
                    return data.errors.map(err => err.msg).join(', ');
                } else if (data.message) {
                    return data.message;
                } else {
                    return 'Invalid registration data. Please check your input.';
                }

            case 409:
                // Conflict - user already exists
                return 'An account with this email already exists. Please sign in instead.';

            case 422:
                // Unprocessable entity - validation failed
                if (data.errors && Array.isArray(data.errors)) {
                    return data.errors.map(err => err.msg).join(', ');
                } else {
                    return 'Please check your input and try again.';
                }

            case 429:
                // Too many requests
                return 'Too many registration attempts. Please try again later.';

            case 500:
                // Server error
                return 'Server error during registration. Please try again later.';

            case 0:
                // Network error
                return 'Network error. Please try again.';

            default:
                // Use the generic error handler for other cases
                return this.getErrorMessage(status, data);
        }
    }

    
}

export default new AuthService();