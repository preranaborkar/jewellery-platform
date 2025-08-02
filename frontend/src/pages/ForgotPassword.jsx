import React from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useForgotPassword } from '../hooks/useAuth';

const ForgotPassword = () => {
    const {
        email,
        setEmail,
        loading,
        error,
        setError,
        handleSubmit,
        navigateToLogin
    } = useForgotPassword();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#D0B49F]/20">
                <div className="text-center mb-6">
                    
                    <h2 className="text-2xl font-bold text-[#523A28] mb-2">Forgot Password?</h2>
                    <p className="text-[#A47551] text-sm">No worries! Enter your email address and we'll send you OTP to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#523A28] mb-2" htmlFor="email">
                            Email Address *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A47551]" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full pl-10 pr-4 py-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-200 text-[#523A28]"
                                placeholder="Enter your email address"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#A47551] to-[#523A28] text-white py-3 rounded-lg hover:from-[#523A28] hover:to-[#A47551] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Sending Reset Link...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <span>Send Reset Link</span>
                            </div>
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                    <button 
                        onClick={navigateToLogin}
                        className="w-full flex items-center justify-center space-x-2 text-[#A47551] hover:text-[#523A28] font-medium transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Sign In</span>
                    </button>
                </div>

                
            </div>
        </div>
    );
};

export default ForgotPassword;