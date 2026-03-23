import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;  // full access  — routes to /SuperAdmin/...
  isStaff: boolean;  // limited access — routes to /Admin/...
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    isStaff: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (!userData || !sessionExpiry) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            isStaff: false,
          });
          return;
        }

        // Check session expiration
        if (Date.now() > Number(sessionExpiry)) {
          localStorage.removeItem('user');
          localStorage.removeItem('sessionExpiry');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            isStaff: false,
          });
          return;
        }

        const user = JSON.parse(userData);
        const isAdmin = user.role === 'admin';  // → /SuperAdmin/...
        const isStaff = user.role === 'staff';  // → /Admin/...

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          isAdmin,
          isStaff,
        });
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          isStaff: false,
        });
      }
    };

    checkAuth();

    // Multi-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionToken' || e.key === 'user') {
        checkAuth();
      }
    };

    // Re-check on visibility (handles browser back button)
    const handleVisibilityChange = () => {
      if (!document.hidden) checkAuth();
    };

    // Re-check on window focus
    const handleFocus = () => checkAuth();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    window.location.href = '/';
  };

  const hasRole = (requiredRole: 'admin' | 'staff') => {
    if (!authState.user) return false;
    if (requiredRole === 'admin') return authState.isAdmin;
    if (requiredRole === 'staff') return authState.isStaff;
    return false;
  };

  return {
    ...authState,
    logout,
    hasRole,
  };
};