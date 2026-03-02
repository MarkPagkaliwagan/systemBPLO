"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullname: "", email: "", contact: "", industry: "", password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4 font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md min-h-[620px] flex flex-col justify-between">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-300">
              LOGO
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Create Account</h2>
          <p className="text-gray-400 text-center mb-8 text-sm">Join us to start your inspection journey</p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              className="w-full p-3.5 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full p-3.5 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200"
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="contact"
                placeholder="Contact No"
                className="w-full p-3.5 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200"
                onChange={handleChange}
              />
              <input
                type="text"
                name="industry"
                placeholder="Industry"
                className="w-full p-3.5 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200"
                onChange={handleChange}
              />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3.5 px-6 rounded-2xl text-gray-700 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200"
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-green-500 text-white p-4 rounded-2xl font-bold text-lg hover:bg-green-600 shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:shadow-none transition-all active:scale-[0.98] mt-4"
            >
              Get Started
            </button>
          </form>
        </div>

        <div className="mt-auto pt-6 text-center">
          <Link href="/module-2-inspection/login" className="text-gray-500 hover:text-green-600 font-medium transition-colors text-sm">
            Already have an account? <span className="text-green-600 underline underline-offset-4">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}