"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4 sm:p-6 font-sans text-gray-900">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-sm sm:max-w-md min-h-150 sm:min-h-155 flex flex-col justify-between">
        <div>
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/bplo-logo.png?v=2" 
              alt="BPLO Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-30 lg:h-30 object-contain rounded-full"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-6 sm:mb-10 text-xs sm:text-sm">Please enter your details to sign in</p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-5">
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
            <Link href="/module-2-inspection/signup" className="text-gray-500 hover:text-green-800 font-medium transition-colors text-xs sm:text-sm">
              Don't have an account? <span className="text-green-800 underline underline-offset-4">Sign Up</span>
            </Link>
            <a href="#" className="text-xs text-gray-400 hover:underline">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  );
}