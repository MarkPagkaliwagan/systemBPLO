"use client";

import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiShield, FiX } from "react-icons/fi";
import { Button } from "./button";

interface User {
  id: number;
  name: string;
  email: string;
  contact_no?: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { id: number }) => Promise<void>;
  user: User | null;
  isLoading?: boolean;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSave,
  user,
  isLoading = false
}: EditUserModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact_no: '',
    role: 'admin' as 'admin' | 'super_admin'
  });
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with user prop data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        contact_no: user.contact_no || '',
        role: user.role || 'admin'
      });
      setNameError('');
    }
  }, [isOpen, user]);

  // Fetch fresh user data when modal opens (GET only — does NOT save anything)
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const currentUser = JSON.parse(userData);

        const sessionData = {
          userId: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          exp: Date.now() + 24 * 60 * 60 * 1000
        };

        const payload = btoa(JSON.stringify(sessionData));
        const signature = btoa('my-secret-key');
        const sessionToken = `${payload}.${signature}`;

        // ✅ GET request — only reads data, does NOT modify anything
        const res = await fetch(`/api/users/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`
          }
        });

        if (res.ok) {
          const freshUserData = await res.json();
          setForm({
            name: freshUserData.name || '',
            email: freshUserData.email || '',
            contact_no: freshUserData.contact_no || '',
            role: freshUserData.role || 'admin'
          });
        }
        // If fetch fails, form already has prop data from the first useEffect
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const nameRegex = /^[a-zA-Z\s\-']*$/;
      setNameError(
        !nameRegex.test(value) && value !== ''
          ? 'Full name can only contain letters, spaces, hyphens, and apostrophes'
          : ''
      );
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-Z\s\-']*$/;
    if (!form.name || !nameRegex.test(form.name)) {
      setNameError('Full name can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }

    if (!form.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ ...form, id: user.id });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-2xl transition-all border border-gray-200">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <FiUser className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Edit User</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/*
           * ✅ KEY FIX: <form> now wraps BOTH the fields AND the footer buttons.
           * Previously the form closed before the footer, so type="submit" had
           * no parent form to submit — clicking "Update User" did nothing.
           */}
          <form onSubmit={handleSubmit}>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      nameError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  <input
                    name="contact_no"
                    type="tel"
                    value={form.contact_no}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none z-10" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-8 py-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[200px]"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Footer — inside <form> so type="submit" triggers handleSubmit */}
            <div className="flex justify-center space-x-3 border-t border-gray-200 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-green-700 hover:bg-green-800 px-4 py-2 text-white"
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Update User
                  </span>
                )}
              </Button>
            </div>

          </form>
          {/* ✅ form ends here — after the footer */}

        </div>
      </div>
    </div>
  );
}