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
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            LOGO
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-500 text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full p-3 rounded-full text-black bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-full text-black bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between text-xs mt-6 px-2">
          <Link href="/module-2-inspection/signup" className="text-gray-500 hover:text-green-600">
            Sign Up
          </Link>
          <a href="#" className="text-gray-500 hover:text-green-600">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}