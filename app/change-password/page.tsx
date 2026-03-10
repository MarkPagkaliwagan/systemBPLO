"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  // Sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) {
        setError("Session expired. Please login again.");
        router.push('/');
        return;
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Get user role for role-based redirect
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        
        // Redirect based on user role after 2 seconds
        setTimeout(() => {
          if (user?.role === 'super_admin') {
            router.push('/SuperAdmin/users'); // Super Admin goes to user management
          } else if (user?.role === 'admin') {
            router.push('/Admin/Inspection/management/analytics'); // Admin goes to dashboard
          } else {
            router.push('/'); // Fallback to login
          }
        }, 2000);
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'p-3' : 'p-6'}`}>
        <div className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-2xl'}`}>
          <div className="mb-6">
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>Change Password</h1>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>Update your account password</p>
          </div>

          <div className={`bg-white rounded-xl shadow-sm ${isMobile ? 'p-4' : 'p-6'}`}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${isMobile ? 'text-sm' : 'text-base'}`}
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    {showPasswords.current ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${isMobile ? 'text-sm' : 'text-base'}`}
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    {showPasswords.new ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className={`mt-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${isMobile ? 'text-sm' : 'text-base'}`}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    {showPasswords.confirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
