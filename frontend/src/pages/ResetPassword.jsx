import React from 'react';
import { Lock, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { useResetPassword } from '../hooks/useAuth';

const ResetPassword = () => {
    const {
        form,
        loading,
        error,
        success,
        showPassword,
        showConfirmPassword,
        resetToken,
        handleChange,
        handleSubmit,
        navigateToForgotPassword,
        navigateToLogin,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility
    } = useResetPassword();

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#D0B49F]/20">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#523A28] mb-4">Password Reset Successfully!</h2>
                        <p className="text-[#A47551] mb-6">Your password has been updated. You can now login with your new password.</p>

                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-6">
                            <p className="font-medium">Redirecting to login page in 3 seconds...</p>
                        </div>

                        <button
                            onClick={navigateToLogin}
                            className="w-full bg-gradient-to-r from-[#A47551] to-[#523A28] text-white py-3 rounded-lg hover:from-[#523A28] hover:to-[#A47551] transition-all duration-300 font-medium transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Go to Login Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#D0B49F]/20">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#523A28] mb-2">Reset Password</h2>
                    <p className="text-[#A47551] text-sm">Enter the OTP from your email and your new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* OTP */}
                    <div>
                        <label className="block text-sm font-medium text-[#523A28] mb-2" htmlFor="otp">
                            6-Digit OTP *
                        </label>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            className="w-full px-4 py-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-200 text-[#523A28] text-center text-lg tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            value={form.otp}
                            onChange={handleChange}
                            style={{ letterSpacing: '0.5em' }}
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-[#523A28] mb-2" htmlFor="newPassword">
                            New Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A47551]" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                className="w-full pl-10 pr-12 py-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-200 text-[#523A28]"
                                placeholder="Enter new password"
                                value={form.newPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A47551] hover:text-[#523A28] transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-[#523A28] mb-2" htmlFor="confirmPassword">
                            Confirm New Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A47551]" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                className="w-full pl-10 pr-12 py-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-200 text-[#523A28]"
                                placeholder="Confirm new password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A47551] hover:text-[#523A28] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                                <span>Resetting Password...</span>
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                {/* Back to Forgot Password */}
                <div className="mt-6 text-center">
                    <button
                        onClick={navigateToForgotPassword}
                        className="inline-flex items-center space-x-2 text-[#A47551] hover:text-[#523A28] font-medium hover:underline transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Email Entry</span>
                    </button>
                </div>

                
            </div>
        </div>
    );
};

export default ResetPassword;