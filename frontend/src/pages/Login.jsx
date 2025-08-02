import React from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

const Login = () => {
    const {
        form,
        loading,
        error,
        showPassword,
        handleChange,
        handleSubmit,
        handleForgotPassword,
        handleGoogleLogin,
        togglePasswordVisibility
    } = useLogin();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#D0B49F]/20">
                <div className="text-center mb-6">
                    
                    <h2 className="text-2xl font-bold text-[#523A28] mb-2">Welcome Back</h2>
                    <p className="text-[#A47551] text-sm">Sign in to your SváRIN account</p>
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
                                placeholder="Enter your email"
                                required
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-[#523A28] mb-2" htmlFor="password">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A47551]" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="w-full pl-10 pr-12 py-3 border border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-200 text-[#523A28]"
                                placeholder="Enter your password"
                                required
                                value={form.password}
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

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-[#A47551] hover:text-[#523A28] font-medium hover:underline transition-colors"
                        >
                            Forgot Password?
                        </button>
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
                                <span>Signing In...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <p className="mt-6 text-center text-sm text-[#A47551]">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-[#523A28] hover:text-[#A47551] font-medium hover:underline transition-colors"
                    >
                        Sign Up here
                    </Link>
                </p>

                {/* Google OAuth */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#D0B49F]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-[#A47551]">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-[#D0B49F] rounded-lg px-4 py-3 shadow-sm hover:shadow-md hover:bg-[#E4D4C8]/20 transition-all duration-200 text-[#523A28] font-medium"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        <span>Continue with Google</span>
                    </button>
                </div>

                
            </div>
        </div>
    );
};

export default Login;