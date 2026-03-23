"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "./components/Spinner";
import EmailVerificationModal from "./components/EmailVerificationModal";
import LoginOtpModal from "./components/LoginOtpModal";
import PageLoader from "./components/Pageloader";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
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
  const [pageLoading, setPageLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  // ── Sidebar-style page loader: show for at least 2 seconds ──
  useEffect(() => {
    const start = Date.now();
    const minDuration = 2000;

    const finish = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDuration - elapsed);
      setTimeout(() => setPageLoading(false), remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      // Fallback in case load already fired
      const fallback = setTimeout(finish, minDuration + 500);
      return () => clearTimeout(fallback);
    }
  }, []);

  // Single-session check: if already logged in, redirect to dashboard
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const sessionExpiry = localStorage.getItem("sessionExpiry");

    if (userData && sessionExpiry) {
      const isExpired = Date.now() > Number(sessionExpiry);
      if (!isExpired) {
        try {
          const user = JSON.parse(userData);
          window.location.href =
            user.role === "super_admin"
              ? "/SuperAdmin/Inspection/management/analytics"
              : "/Admin/Inspection/management/analytics";
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("sessionExpiry");
        }
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("sessionExpiry");
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");
    setVerificationError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresEmailVerification) {
          setVerificationUser(data.user);
          setVerificationError("");
          setShowEmailVerificationModal(true);
          await sendVerificationEmail(data.user.email, data.user.id);
        } else if (data.requiresOTP) {
          setOtpUser(data.user);
          setShowOtpModal(true);
          await sendOtp(data.user.email, data.user.id);
        } else {
          handleSuccessfulLogin(data);
        }
      } else {
        alert(data.error || "Login failed");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.username.trim(),
          password: form.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");
    } catch (error) {
      console.error("Send OTP error:", error);
      setOtpError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpVerify = async (otp: string) => {
    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpUser.email,
          otp: otp,
          userId: otpUser.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSuccess("Login verification successful!");
        // After 1.5s success message, close modal and show PageLoader before redirect
        setTimeout(() => {
          setShowOtpModal(false);
          setRedirecting(true);          // ← triggers PageLoader
          handleSuccessfulLogin(data);
        }, 1500);
      } else {
        setOtpError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Network error. Please try again.");
    } finally {
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
    setVerificationError("");
    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to send verification email");
    } catch (error) {
      console.error("Send verification email error:", error);
      setVerificationError(
        "Failed to send verification email. Please try again."
      );
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
    setVerificationLoading(true);
    setVerificationError("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationUser.email,
          otp: otp,
          userId: verificationUser.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationSuccess("Your email has been verified successfully!");
        setTimeout(() => {
          setShowEmailVerificationModal(false);
          setVerificationUser(null);
          handleSuccessfulLogin({
            user: data.user,
            expiresIn: 24 * 60 * 60 * 1000,
          });
        }, 1500);
      } else {
        setVerificationError(
          data.error || "Invalid verification code. Please try again."
        );
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationError("Network error. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleEmailVerificationResend = async () => {
    setVerificationError("");
    setVerificationLoading(true);
    try {
      await sendVerificationEmail(
        verificationUser.email,
        verificationUser.id
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSuccessfulLogin = (data: any) => {
    const expiresIn =
      typeof data.expiresIn === "number"
        ? data.expiresIn
        : 24 * 60 * 60 * 1000;
    const expiry = String(Date.now() + expiresIn);
    const userJson = JSON.stringify(data.user);

    localStorage.setItem("user", userJson);
    localStorage.setItem("sessionExpiry", expiry);
    sessionStorage.setItem("user", userJson);
    sessionStorage.setItem("sessionExpiry", expiry);

    const destination =
      data.user.role === "super_admin"
        ? "/SuperAdmin/Inspection/management/analytics"
        : "/Admin/Inspection/management/analytics";

    // 2-second delay so the PageLoader is visible before navigating
    setTimeout(() => {
      window.location.href = destination;
    }, 2000);
  };

  return (
    <>
      {/* PageLoader: shown on initial page load AND after OTP success → redirect */}
      <PageLoader isVisible={pageLoading || redirecting} />

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
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-green-800 hover:opacity-70 transition-opacity"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-400 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-800 text-white p-4 rounded-2xl font-bold text-lg hover:bg-green-900 shadow-[0_10px_20px_rgba(20,83,45,0.2)] hover:shadow-none transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner /> : "Sign In"}
              </button>
            </form>
          </div>
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
        success={verificationSuccess}
      />
    </>
  );
}