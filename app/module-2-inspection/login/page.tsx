"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in:", form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Added min-h-[600px] to match the Register card's natural height */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm min-h-[580px] flex flex-col justify-between">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              LOGO
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-500 text-center mb-8">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full p-3 px-5 rounded-full text-black bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 px-5 rounded-full text-black bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                onChange={handleChange}
                required
              />
            </div>

            {/* Subtle spacer to push the button down slightly to mimic register layout */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-3 rounded-full font-semibold hover:bg-green-600 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Login
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div className="flex justify-between text-sm px-2 mb-4">
            <Link href="/module-2-inspection/signup" className="text-green-600 font-medium hover:underline">
              Create Account
            </Link>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              Forgot password?
            </a>
          </div>
          
          <p className="text-center text-xs text-gray-400 border-t pt-4">
            By logging in, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}