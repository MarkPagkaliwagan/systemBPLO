"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "./components/Spinner";
import EmailVerificationModal from "./components/EmailVerificationModal";
import LoginOtpModal from "./components/LoginOtpModal";
import PageLoader from "./components/Pageloader";
import InvalidCredentialsModal from "./components/Invalidcredentialsmodal";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const isRedirectingRef = useRef(false);

  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpUser, setOtpUser] = useState<any>(null);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [verificationUser, setVerificationUser] = useState<any>(null);
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [isVerificationResending, setIsVerificationResending] = useState(false);

  // ── Page loader ────────────────────────────────────────────────────────
  useEffect(() => {
    const start = Date.now();
    const MIN = 3000;
    const finish = () => {
      const remaining = Math.max(0, MIN - (Date.now() - start));
      setTimeout(() => setPageLoading(false), remaining);
    };
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      const fallback = setTimeout(finish, MIN + 500);
      return () => clearTimeout(fallback);
    }
  }, []);

  // ── Single-session guard ───────────────────────────────────────────────
  // FIX: Before checking localStorage, verify the sessionExpiry is still valid.
  // Previously, stale localStorage data (user still set but cookie expired) caused
  // the login page to redirect the user back to the dashboard, which middleware
  // blocked → redirect back to / → infinite reload loop.
  useEffect(() => {
    if (isRedirectingRef.current) return;

    const userData = localStorage.getItem("user");
    const sessionExpiry = localStorage.getItem("sessionExpiry");

    if (!userData || !sessionExpiry) return;

    // ↓ If expiry has passed, clear everything and stay on login page
    if (Date.now() > Number(sessionExpiry)) {
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("sessionExpiry");
      return; // Stay on login — do NOT redirect
    }

    // Only redirect if session is genuinely still valid
    try {
      const user = JSON.parse(userData);
      const destination =
        user.role === "admin"
          ? "/SuperAdmin/Inspection/management/analytics"
          : "/Admin/Inspection/management/analytics";
      isRedirectingRef.current = true;
      window.location.replace(destination);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiry");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("sessionExpiry");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showError = (message: string) => {
    setInvalidMessage(message);
    setShowInvalidModal(true);
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
      data.user.role === "admin"
        ? "/SuperAdmin/Inspection/management/analytics"
        : "/Admin/Inspection/management/analytics";

    isRedirectingRef.current = true;
    setRedirecting(true);

    setTimeout(() => {
      window.location.href = destination;
    }, 2500);
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
          try {
            const otpRes = await fetch("/api/auth/send-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.username.trim(),
                password: form.password,
              }),
            });
            const otpData = await otpRes.json();

            if (otpData.loginSuccess) {
              handleSuccessfulLogin(otpData);
            } else {
              setOtpUser(data.user);
              setShowOtpModal(true);
              try {
                const sendRes = await fetch("/api/auth/send-otp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: form.username.trim(),
                    password: form.password,
                  }),
                });
                const sendData = await sendRes.json();
                if (!sendRes.ok) {
                  setOtpError(sendData.error || "Failed to send OTP");
                }
              } catch (err) {
                console.error("Send OTP error:", err);
                setOtpError("Failed to send OTP. Please try again.");
              }
            }
          } catch (err) {
            console.error("OTP check error:", err);
            showError("An error occurred during OTP check. Please try again.");
          }
        } else {
          handleSuccessfulLogin(data);
        }
      } else {
        showError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      showError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpUser.email, otp, userId: otpUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSuccess("Login verification successful!");
        setShowOtpModal(false);
        handleSuccessfulLogin(data);
      } else {
        setOtpError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpResend = async () => {
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpUser.email,
          password: form.password,
          isResend: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to resend OTP");
      } else {
        setOtpSuccess("New OTP sent successfully");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpModalClose = () => {
    if (!otpLoading) {
      setShowOtpModal(false);
      setOtpUser(null);
      setOtpError("");
    }
  };

  const sendVerificationEmail = async (email: string, userId: string) => {
    setVerificationError("");
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification email");
    } catch (err) {
      console.error("Send verification email error:", err);
      setVerificationError("Failed to send verification email. Please try again.");
    }
  };

  const handleEmailVerification = async (otp: string) => {
    setVerificationLoading(true);
    setVerificationError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationUser.email,
          otp,
          userId: verificationUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowEmailVerificationModal(false);
        setVerificationUser(null);
        setTimeout(() => {
          handleSuccessfulLogin({
            user: data.user,
            expiresIn: data.expiresIn,
            sessionToken: data.sessionToken,
          });
        }, 50);
      } else {
        setVerificationError(data.error || "Invalid verification code. Please try again.");
      }
    } catch (err) {
      console.error("Email verification error:", err);
      setVerificationError("Network error. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleEmailVerificationResend = async () => {
    if (!verificationUser) return;
    setIsVerificationResending(true);
    setVerificationError("");
    try {
      await sendVerificationEmail(verificationUser.email, verificationUser.id);
    } catch (err) {
      console.error("Resend verification email error:", err);
      setVerificationError("Failed to resend verification email. Please try again.");
    } finally {
      setIsVerificationResending(false);
    }
  };

  const handleEmailVerificationModalClose = () => {
    if (!verificationLoading) {
      setShowEmailVerificationModal(false);
      setVerificationUser(null);
      setVerificationError("");
    }
  };

  return (
    <>
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
                <Link href="/forgot-password" className="text-xs text-gray-400 hover:underline">
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

      <InvalidCredentialsModal
        isOpen={showInvalidModal}
        onClose={() => setShowInvalidModal(false)}
        message={invalidMessage}
      />

      <LoginOtpModal
        isOpen={showOtpModal}
        onClose={handleOtpModalClose}
        email={otpUser?.email || ""}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        isLoading={otpLoading}
        isResending={isResending}
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
        isResending={isVerificationResending}
        error={verificationError}
      />
    </>
  );
}