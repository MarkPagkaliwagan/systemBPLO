"use client";

import React, { useState, useEffect } from "react";
import { FiMail, FiRefreshCw } from "react-icons/fi";
import Spinner from "./Spinner";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  isResending?: boolean;
  error?: string;
  success?: string;
}

const EmailVerificationModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  isLoading = false,
  isResending = false,
  error,
  success,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOtp(["", "", "", "", "", ""]);
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

  const handleInputChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }

      const otpString = newOtp.join("");
      if (otpString.length === 6 && value && !isLoading) {
        setTimeout(() => {
          onVerify(otpString);
        }, 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData
        .split("")
        .concat(Array(6 - pastedData.length).fill(""));
      setOtp(newOtp);
      if (pastedData.length === 6 && !isLoading) {
        setTimeout(() => onVerify(pastedData), 100);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === 6) {
      await onVerify(otpString);
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setTimeLeft(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-auto transform transition-all scale-100 opacity-100">
        {/* Header */}
        <div className="bg-green-900 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-center space-x-3">
            <FiMail className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Email Verification
            </h2>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center mb-6">
            <p className="text-sm sm:text-base text-gray-600 mb-2">We've sent a 6-digit code to:</p>
            <p className="font-semibold text-sm sm:text-base text-gray-800">{email}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center space-x-1 sm:space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-10 sm:w-12 h-10 sm:h-12 text-center text-lg sm:text-xl text-gray-800 font-semibold border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || isResending || otp.join("").length !== 6}
              className={`w-full py-2 sm:py-3 text-sm sm:text-base font-medium rounded-xl transition-colors duration-200 ${
                isLoading || isResending || otp.join("").length !== 6
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-800 hover:bg-green-900 text-white"
              }`}
            >
              {isLoading ? <Spinner /> : "Verify Email"}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              {canResend
                ? "Didn't receive the code?"
                : `Code expires in ${formatTime(timeLeft)}`}
            </p>

            {canResend && (
              <button
                onClick={handleResend}
                disabled={isResending}
                className={`inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors text-xs sm:text-sm ${
                  isResending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FiRefreshCw
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${isResending ? "animate-spin" : ""}`}
                />
                <span>{isResending ? "Sending..." : "Resend Code"}</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <button
            onClick={!isLoading ? onClose : undefined}
            disabled={isLoading}
            className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;