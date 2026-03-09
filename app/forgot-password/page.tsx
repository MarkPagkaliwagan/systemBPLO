"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
    setSuccess("");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setEmail("");
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4 sm:p-6 font-sans text-gray-900">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/bplo-logo.png"
            alt="BPLO Logo"
            className="w-24 h-24 object-contain rounded-full"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          Forgot Password
        </h2>

        <p className="text-gray-400 text-center mb-8 text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full p-4 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-800 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-800 text-white p-4 rounded-2xl font-bold text-lg hover:bg-green-900 shadow-[0_10px_20px_rgba(20,83,45,0.2)] hover:shadow-none transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-400 hover:text-green-800 hover:underline transition-colors"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
