import { useState, useEffect, useLayoutEffect, useRef } from 'react';

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
  isAdmin: boolean;
  isStaff: boolean;
}

const UNAUTHENTICATED: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
};

const INITIAL: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(INITIAL);

  // Guards to prevent redundant/concurrent calls
  const isCheckingRef = useRef(false);
  const isAuthenticatedRef = useRef(false);

  // ── 1. Sync localStorage check — before first paint ──────────────────
  useIsomorphicLayoutEffect(() => {
    try {
      const userData =
        localStorage.getItem('user') || sessionStorage.getItem('user');
      const sessionExpiry =
        localStorage.getItem('sessionExpiry') ||
        sessionStorage.getItem('sessionExpiry');

      if (userData && sessionExpiry && Date.now() <= Number(sessionExpiry)) {
        const user = JSON.parse(userData);
        isAuthenticatedRef.current = true;
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isStaff: user.role === 'staff',
        });
        return;
      }
    } catch {
      // ignore
    }
    isAuthenticatedRef.current = false;
    setAuthState(UNAUTHENTICATED);
  }, []);

  // ── 2. Background server-side session validation ──────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      // Don't run if already checking or if we know user is not authenticated
      // (prevents loops when on login page / unauthenticated state)
      if (isCheckingRef.current) return;
      if (!isAuthenticatedRef.current) return;

      isCheckingRef.current = true;

      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          if (data.valid && data.user) {
            isAuthenticatedRef.current = true;
            setAuthState({
              user: data.user,
              isLoading: false,
              isAuthenticated: true,
              isAdmin: data.user.role === 'admin',
              isStaff: data.user.role === 'staff',
            });
          } else {
            // Session invalid — clear everything
            localStorage.removeItem('user');
            localStorage.removeItem('sessionExpiry');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('sessionExpiry');
            isAuthenticatedRef.current = false;
            setAuthState(UNAUTHENTICATED);
          }
        }
      } catch {
        console.log('Server session check failed, relying on localStorage');
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Only run initial server check if we think we're authenticated
    checkAuth();

    // Multi-tab sync — only re-check if currently authenticated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionToken' || e.key === 'user') {
        isAuthenticatedRef.current = !!localStorage.getItem('user');
        checkAuth();
      }
    };

    // Re-check on visibility/focus ONLY if authenticated
    // This prevents the reload loop on the login page
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticatedRef.current) checkAuth();
    };
    const handleFocus = () => {
      if (isAuthenticatedRef.current) checkAuth();
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
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    isAuthenticatedRef.current = false;
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('sessionExpiry');
    window.location.href = '/';
  };

  const hasRole = (requiredRole: 'admin' | 'staff') => {
    if (!authState.user) return false;
    if (requiredRole === 'admin') return authState.isAdmin;
    if (requiredRole === 'staff') return authState.isStaff;
    return false;
  };

  return { ...authState, logout, hasRole };
};