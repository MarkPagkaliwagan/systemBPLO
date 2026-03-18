import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isSuperAdmin: false,
    isAdmin: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        // For client-side, we rely on localStorage since httpOnly cookies aren't accessible
        const userData = localStorage.getItem('user');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (!userData || !sessionExpiry) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isSuperAdmin: false,
            isAdmin: false,
          });
          return;
        }

        // Check session expiration
        if (Date.now() > parseInt(sessionExpiry)) {
          // Clear expired session
          localStorage.removeItem('user');
          localStorage.removeItem('sessionExpiry');
          
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isSuperAdmin: false,
            isAdmin: false,
          });
          return;
        }

        const user = JSON.parse(userData);
        const isAuthenticated = true;
        const isSuperAdmin = user.role === 'super_admin';
        const isAdmin = user.role === 'admin' || user.role === 'super_admin';

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated,
          isSuperAdmin,
          isAdmin,
        });
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isSuperAdmin: false,
          isAdmin: false,
        });
      }
    };

    checkAuth();

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionToken' || e.key === 'user') {
        checkAuth();
      }
    };

    // Listen for page visibility changes (for browser back button)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    // Listen for window focus (additional safeguard)
    const handleFocus = () => {
      checkAuth();
    };

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
      // Call logout API to clear the HTTP-only cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    
    // Redirect to login page
    window.location.href = '/';
  };

  const hasRole = (requiredRole: 'admin' | 'super_admin') => {
    if (!authState.user) return false;
    if (requiredRole === 'super_admin') return authState.isSuperAdmin;
    if (requiredRole === 'admin') return authState.isAdmin;
    return false;
  };

  return {
    ...authState,
    logout,
    hasRole,
  };
};
