"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiShield, FiRefreshCw, FiX } from 'react-icons/fi';
import Spinner from './Spinner';

interface LoginOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

const LoginOtpModal: React.FC<LoginOtpModalProps> = ({ 
  isOpen, 
  onClose, 
  email, 
  onVerify, 
  onResend, 
  isLoading = false,
  error,
  success 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(120);
      setCanResend(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    const otpString = otp.join('');
    console.log('OTP useEffect - otpString:', otpString, 'isLoading:', isLoading, 'isSubmitting:', isSubmitting.current);
    
    if (otpString.length === 6 && !isLoading && !isSubmitting.current) {
      // Mark as submitting to prevent multiple submissions
      isSubmitting.current = true;
      
      // Add small delay for better UX
      const timer = setTimeout(() => {
        console.log('Auto-submitting OTP:', otpString);
        onVerify(otpString);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [otp, onVerify]); // Remove isLoading from dependencies

  // Reset submission flag when loading changes
  useEffect(() => {
    if (!isLoading) {
      isSubmitting.current = false;
    }
  }, [isLoading]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`login-otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);

      // Auto-submit if 6 digits were pasted
      if (pastedData.length === 6 && !isLoading) {
        setTimeout(() => {
          onVerify(pastedData);
        }, 100); // Small delay to ensure state is updated
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      await onVerify(otpString);
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setTimeLeft(120);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100 opacity-100">
        {/* Close button */}
        <button
          onClick={!isLoading ? onClose : undefined}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <FiX size={20} />
        </button>

        {/* Header */}
        <div className="bg-green-800 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-center space-x-3">
            <FiShield className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">OTP Login Verification</h2>
          </div>
        </div>
        
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              Enter the 6-digit code sent to:
            </p>
            <p className="font-semibold text-gray-800">{email}</p>
          </div>

          {error && !success && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 111.414 0L8 9.586 7.293a1 1 0 00-1.414 1.414L8 11.414l2.293 2.293a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L8 7.586 5.293a1 1 0 00-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`login-otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  disabled={isLoading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className={`w-full py-3 font-medium rounded-xl transition-colors duration-200 ${
                isLoading || otp.join('').length !== 6
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'  
                  : 'bg-green-800 hover:bg-green-900 text-white'
              }`}
            >
              {isLoading ? <Spinner /> : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {canResend ? (
                "Didn't receive the code?"
              ) : (
                `Code expires in ${formatTime(timeLeft)}`
              )}
            </p>
            
            {canResend && (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className={`inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Sending...' : 'Resend Code'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={!isLoading ? onClose : undefined}
            disabled={isLoading}
            className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginOtpModal;
