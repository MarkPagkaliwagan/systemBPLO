"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.username, 
          password: form.password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store custom session and redirect
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionToken', data.sessionToken);
        localStorage.setItem('sessionExpiry', Date.now() + data.expiresIn);
        window.location.href = '/SuperAdmin/users';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4 sm:p-6 font-sans text-gray-900">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-xs sm:max-w-sm min-h-[600px] sm:min-h-[620px] flex flex-col justify-between">
        <div>
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/bplo-logo.png?v=2" 
              alt="BPLO Logo" 
              className="w-40 h-40 sm:w-40 sm:h-40 lg:w-40 lg:h-40 object-contain rounded-full"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">BPLO Inspection Management System</h2>
          <p className="text-gray-400 text-center mb-6 sm:mb-10 text-xs sm:text-sm">Please enter your details to sign in</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full p-3 sm:p-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-800 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 text-sm sm:text-base"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 sm:p-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-800 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 text-sm sm:text-base"
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-800 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-green-900 shadow-[0_10px_20px_rgba(20,83,45,0.2)] hover:shadow-none transition-all active:scale-[0.98] mt-3 sm:mt-4"
            >
              Sign In
            </button>
          </form>
        </div>

        <div className="mt-auto pt-6 sm:pt-8">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <a href="#" className="text-xs text-gray-400 hover:underline">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  );
}


