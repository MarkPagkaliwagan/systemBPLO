"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "./components/Spinner";
import EmailVerificationModal from "./components/EmailVerificationModal";
import LoginOtpModal from "./components/LoginOtpModal";

export default function LoginPage() {

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [otpUser, setOtpUser] = useState<any>(null);
  const [verificationUser, setVerificationUser] = useState<any>(null);
  const [otpError, setOtpError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setOtpError("");
    setVerificationError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.username.trim(),
          password: form.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresEmailVerification) {
          // User needs to verify email first
          setVerificationUser(data.user);
          setVerificationError(""); // Clear any previous errors
          setShowEmailVerificationModal(true);
          
          // Automatically send verification email
          await sendVerificationEmail(data.user.email, data.user.id);
        } else if (data.requiresOTP) {
          // Credentials valid, show OTP modal
          setOtpUser(data.user);
          setShowOtpModal(true);
          
          // Automatically send OTP
          await sendOtp(data.user.email, data.user.id);
        } else {
          // Fallback for direct login (shouldn't happen with new flow)
          handleSuccessfulLogin(data);
        }
      } else {
        // Handle specific error messages
        const errorMessage = data.error || "Login failed";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpModalClose = () => {
    if (!otpLoading) {
      setShowOtpModal(false);
      setOtpUser(null);
      setOtpError("");
    }
  };

  const sendOtp = async (email: string, userId: string) => {
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.username.trim(),
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setOtpError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpVerify = async (otp: string) => {
    console.log('handleOtpVerify called - otp:', otp, 'current otpLoading:', otpLoading);
    setOtpLoading(true);
    setOtpError("");
    console.log('Set otpLoading to true');

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: otpUser.email,
          otp: otp,
          userId: otpUser.id
        })
      });

      const data = await response.json();
      console.log('OTP verify response:', data);

      if (response.ok) {
        // OTP verified successfully, complete login
        setOtpSuccess("Login verification successful!");
        
        setTimeout(() => {
          setShowOtpModal(false);
          handleSuccessfulLogin(data);
        }, 1500);
      } else {
        setOtpError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Network error. Please try again.");
    } finally {
      console.log('Setting otpLoading to false');
      setOtpLoading(false);
    }
  };

  const handleOtpResend = async () => {
    setOtpLoading(true);
    try {
      await sendOtp(otpUser.email, otpUser.id);
    } finally {
      setOtpLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string, userId: string) => {
    setVerificationError(""); // Clear previous errors
    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          userId: userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Send verification email error:", error);
      setVerificationError("Failed to send verification email. Please try again.");
    }
  };

  const handleEmailVerificationModalClose = () => {
    if (!verificationLoading) {
      setShowEmailVerificationModal(false);
      setVerificationUser(null);
      setVerificationError("");
    }
  };

  const handleEmailVerification = async (otp: string) => {
    console.log('handleEmailVerification called - otp:', otp, 'current verificationLoading:', verificationLoading);
    setVerificationLoading(true);
    setVerificationError("");
    console.log('Set verificationLoading to true');

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: verificationUser.email,
          otp: otp,
          userId: verificationUser.id
        })
      });

      const data = await response.json();
      console.log('Email verify response:', data);

      if (response.ok) {
        // Email verified successfully, go directly to dashboard
        setVerificationSuccess("Your email has been verified successfully!");
        
        setTimeout(() => {
          setShowEmailVerificationModal(false);
          setVerificationUser(null);
          
          // Direct to dashboard with user data from verify-email response
          handleSuccessfulLogin({
            user: data.user,
            sessionToken: "verified-session-token", // or create real session
            expiresIn: 24 * 60 * 60 * 1000
          });
        }, 1500);
      } else {
        setVerificationError(data.error || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationError("Network error. Please try again.");
    } finally {
      console.log('Setting verificationLoading to false');
      setVerificationLoading(false);
    }
  };

  const handleEmailVerificationResend = async () => {
    setVerificationError(""); // Clear previous errors before resending
    setVerificationLoading(true);
    try {
      await sendVerificationEmail(verificationUser.email, verificationUser.id);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSuccessfulLogin = (data: any) => {
    // Store user data in localStorage for client-side access (non-sensitive)
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("sessionExpiry", Date.now() + data.expiresIn);

    // Redirect to appropriate dashboard based on user role
    if (data.user.role === 'super_admin') {
      window.location.href = "/SuperAdmin/Inspection/management/analytics";
    } else if (data.user.role === 'admin') {
      window.location.href = "/Admin/Inspection/management/analytics";
    } else {
      window.location.href = "/Admin/Inspection/management/analytics";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4 sm:p-6 font-sans text-gray-900">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-sm min-h-[600px] flex flex-col justify-between">
        <div>
          <div className="flex justify-center mb-6">
            <img
              src="/bplo-logo.png"
              alt="BPLO Logo"
              className="w-36 h-36 object-contain rounded-full"
            />
          </div>
          <h2 className="text-md font-bold text-gray-800 text-center mb-2">
            Business Permit and Licensing Office
          </h2>
          <p className="text-sm font-bold text-gray-800 text-center mb-6">
            Inspection Management System
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-4 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-800 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all"
              onChange={handleChange}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full p-4 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-800 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-green-800 hover:opacity-70 transition-opacity">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-gray-400 hover:underline">
                Forgot your password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white p-4 rounded-2xl font-bold text-lg hover:bg-green-900 shadow-[0_10px_20px_rgba(20,83,45,0.2)] hover:shadow-none transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <Spinner /> : "Sign In"}
            </button>
          </form>
        </div>

      </div>

      <LoginOtpModal
        isOpen={showOtpModal}
        onClose={handleOtpModalClose}
        email={otpUser?.email || ""}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        isLoading={otpLoading}
        error={otpError}
        success={otpSuccess}
      />

      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={handleEmailVerificationModalClose}
        email={verificationUser?.email || ""}
        onVerify={handleEmailVerification}
        onResend={handleEmailVerificationResend}
        isLoading={verificationLoading}
        error={verificationError}
      />

    </div>

  );
}
