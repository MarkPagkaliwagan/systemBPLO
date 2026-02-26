"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    contact: "",
    industry: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering:", form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            LOGO
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            className="w-full p-3 rounded-full bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-full bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact No"
            className="w-full p-3 rounded-full bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
          />
          <input
            type="text"
            name="industry"
            placeholder="Industry Type"
            className="w-full p-3 rounded-full bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-full bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <Link href="/module-2-inspection/login" className="text-green-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}