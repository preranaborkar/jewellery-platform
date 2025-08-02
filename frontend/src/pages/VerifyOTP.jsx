import React, { useRef, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useVerifyOTP } from '../hooks/useAuth';

const VerifyOTP = () => {
    const {
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
    } = useVerifyOTP();

    const inputRefs = useRef([]);

    // Auto-focus first input
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6);
                const newOtp = [...otp];
                for (let i = 0; i < digits.length; i++) {
                    newOtp[i] = digits[i];
                }
                setOtp(newOtp);

                // Focus the next empty input or last input
                const nextIndex = Math.min(digits.length, 5);
                inputRefs.current[nextIndex]?.focus();
            });
        }
    };

    const handleInputChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) return;

        handleOtpChange(index, value);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#D0B49F]/20">
                {/* Header */}
                <div className="text-center mb-6">
                    
                    <h2 className="text-2xl font-bold text-[#523A28] mb-2">Verify Your Email</h2>
                    <p className="text-[#A47551] text-sm">
                        We've sent a 6-digit verification code to
                    </p>
                    <p className="text-[#523A28] font-medium text-sm mt-1">
                        {email ? maskEmail(email) : 'No email found'}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* OTP Input */}
                    <div>
                        <label className="block text-sm font-medium text-[#523A28] mb-3 text-center">
                            Enter Verification Code
                        </label>
                        <div className="flex justify-center space-x-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="1"
                                    className="w-12 h-12 text-center text-lg font-bold border-2 border-[#D0B49F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47551] focus:border-transparent transition-all duration-200 text-[#523A28]"
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/, ''))}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                />
                            ))}
                        </div>
                       
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-[#A47551] to-[#523A28] text-white py-3 rounded-lg hover:from-[#523A28] hover:to-[#A47551] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                        disabled={loading || otp.join('').length !== 6}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            'Verify Email'
                        )}
                    </button>
                </div>

                {/* Resend OTP */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-[#A47551] mb-3">
                        Didn't receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0 || resendLoading}
                        className="inline-flex items-center gap-2 text-[#523A28] hover:text-[#A47551] font-medium text-sm hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                    >
                        <RefreshCw className={`h-4 w-4 ${resendLoading ? 'animate-spin' : ''}`} />
                        {resendCooldown > 0 ? (
                            `Resend OTP in ${resendCooldown}s`
                        ) : resendLoading ? (
                            'Sending...'
                        ) : (
                            'Resend OTP'
                        )}
                    </button>
                </div>

                {/* Back to Register */}
                <div className="mt-6 text-center">
                    <button
                        onClick={navigateToRegister}
                        className="inline-flex items-center gap-2 text-[#A47551] hover:text-[#523A28] font-medium text-sm hover:underline transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Registration
                    </button>
                </div>

                
            </div>
        </div>
    );
};

export default VerifyOTP;