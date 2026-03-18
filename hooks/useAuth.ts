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
        // Get session token from cookie
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`.split(`; ${name}=`);
          if (value.length === 2) return value.pop()?.split(';').shift();
          return '';
        };
        
        const sessionToken = getCookie('session-token');
        const userData = localStorage.getItem('user');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (!sessionToken || !userData || !sessionExpiry) {
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
          document.cookie = 'session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    document.cookie = 'session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
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
