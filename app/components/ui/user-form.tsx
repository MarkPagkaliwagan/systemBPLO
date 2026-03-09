"use client";

import { useState, useRef, useEffect } from "react";
import { FiUser, FiMail, FiShield } from "react-icons/fi";
import { Button } from "./button";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
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
    password: initialData?.password || '',
    role: initialData?.role || 'admin',
  });

  const [isMobile, setIsMobile] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert('Please fill in all fields');
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'} gap-${isMobile ? '4' : '6'}`}>
        <div>
          <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-${isMobile ? '1' : '2'}`}>
            Full Name
          </label>
          <div className="relative">
            <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
            <input
              ref={nameInputRef}
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-${isMobile ? '2' : '3'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isMobile ? 'text-sm' : 'text-base'}`}
            />
          </div>
        </div>
        <div>
          <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-${isMobile ? '1' : '2'}`}>
            Email Address
          </label>
          <div className="relative">
            <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-${isMobile ? '2' : '3'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isMobile ? 'text-sm' : 'text-base'}`}
            />
          </div>
        </div>
        <div>
          <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-${isMobile ? '1' : '2'}`}>
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className={`w-full px-3 py-${isMobile ? '2' : '3'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isMobile ? 'text-sm' : 'text-base'}`}
          />
        </div>
        <div>
          <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-${isMobile ? '1' : '2'}`}>
            Role
          </label>
          <div className="relative">
            <FiShield className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 pointer-events-none`} />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-${isMobile ? '2' : '3'} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none ${isMobile ? 'text-sm' : 'text-base'}`}
            >
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>
        </div>
      </div>
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row space-x-3'}`}>
        <Button
          type="submit"
          disabled={isLoading}
          className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'w-full justify-center py-3' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${isMobile ? 'mr-2' : 'mr-2'}`} />
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
          className={isMobile ? 'w-full justify-center py-3' : ''}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
