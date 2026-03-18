"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "./components/Spinner";

export default function LoginPage() {

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

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
          <p className="text-sm font-bold text-gray-800 text-center mb-2">
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

    </div>

  );
}