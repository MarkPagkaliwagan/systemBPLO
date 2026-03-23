"use client";

import { useState, useRef, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiShield, FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { Button } from "./button";
import { generateSecurePassword } from "@/lib/clientPasswordUtils";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  contact_no?: string;
  role: 'admin' | 'staff';
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<UserFormData>;
}

export function UserForm({ onSubmit, onCancel, isLoading = false, initialData }: UserFormProps) {
  const [form, setForm] = useState<UserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: initialData?.password || generateSecurePassword(),
    contact_no: initialData?.contact_no || '',
    role: initialData?.role || 'admin',
  });

  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const PHONE_MAX = 11;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Letters, spaces, and apostrophes only — no digits, no hyphens
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    if (allowed.includes(e.key)) return;
    if (/^[a-zA-Z\s']$/.test(e.key)) return; // removed \- 
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      // Strip digits, hyphens, and all other non-letter chars (handles paste)
      const cleaned = value.replace(/[^a-zA-Z\s']/g, ''); // removed \-
      setNameError(
        value !== cleaned && value !== ''
          ? 'Full name can only contain letters, spaces, and apostrophes'
          : ''
      );
      setForm(prev => ({ ...prev, name: cleaned }));
      return;
    }

    if (name === 'contact_no') {
      const digitsOnly = value.replace(/[^0-9]/g, '');
      const trimmed = digitsOnly.slice(0, PHONE_MAX);
      setPhoneError(
        trimmed.length > 0 && trimmed.length < PHONE_MAX
          ? `PH mobile number must be exactly ${PHONE_MAX} digits`
          : ''
      );
      setForm(prev => ({ ...prev, contact_no: trimmed }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    if (allowed.includes(e.key)) return;
    if (/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
  };

  const regeneratePassword = () => {
    setForm(prev => ({ ...prev, password: generateSecurePassword() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) {
      setNameError('Full name is required');
      return;
    }

    if (!form.email || !form.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (form.contact_no && form.contact_no.length !== PHONE_MAX) {
      setPhoneError(`PH mobile number must be exactly ${PHONE_MAX} digits`);
      return;
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div>
            <div className="relative">
              <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                ref={nameInputRef}
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                onKeyDown={handleNameKeyDown}
                className={`w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
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
            <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
            <span className="ml-1 text-xs text-gray-400 font-normal">
              ({form.contact_no?.length || 0}/{PHONE_MAX})
            </span>
          </label>
          <div>
            <div className="relative">
              <FiPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                name="contact_no"
                type="tel"
                placeholder="09XXXXXXXXX"
                value={form.contact_no}
                onChange={handleChange}
                onKeyDown={handlePhoneKeyDown}
                maxLength={PHONE_MAX}
                inputMode="numeric"
                className={`w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-sm text-red-600">{phoneError}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-generated Password *
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="w-full pr-20 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
              readOnly
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
            <button
              type="button"
              onClick={regeneratePassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Generate new password"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <div className="relative">
            <FiShield className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[200px]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="admin">Administrator</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

      </div>

      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {initialData?.name ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <span className="flex items-center">
              {initialData?.name ? 'Update User' : 'Create User'}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
