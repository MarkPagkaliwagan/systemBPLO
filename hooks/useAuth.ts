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

// ── Helper: wipe all auth-related storage ────────────────────────────────────
function clearAuthStorage() {
  localStorage.removeItem('user');
  localStorage.removeItem('sessionExpiry');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('sessionExpiry');
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(INITIAL);

  const isCheckingRef = useRef(false);
  const isAuthenticatedRef = useRef(false);

  // ── 1. Sync localStorage check — before first paint ──────────────────────
  useIsomorphicLayoutEffect(() => {
    try {
      const userData =
        localStorage.getItem('user') || sessionStorage.getItem('user');
      const sessionExpiry =
        localStorage.getItem('sessionExpiry') ||
        sessionStorage.getItem('sessionExpiry');

      if (userData && sessionExpiry) {
        // ↓ Session expired in localStorage → clear it immediately
        //   This is the ROOT CAUSE of the reload loop: stale data in localStorage
        //   made the login page think the user was still authenticated and tried
        //   to redirect them back to the dashboard, which middleware then blocked.
        if (Date.now() > Number(sessionExpiry)) {
          clearAuthStorage();
          isAuthenticatedRef.current = false;
          setAuthState(UNAUTHENTICATED);
          return;
        }

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
      clearAuthStorage();
    }

    isAuthenticatedRef.current = false;
    setAuthState(UNAUTHENTICATED);
  }, []);

  // ── 2. Background server-side session validation ──────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
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
            // Server says session is invalid → clear storage and go to /session-expired
            // ↑ Changed: was just clearing storage and setting UNAUTHENTICATED state.
            //   Now we also navigate to /session-expired so the user sees the page
            //   instead of silently landing on a broken state.
            clearAuthStorage();
            isAuthenticatedRef.current = false;
            setAuthState(UNAUTHENTICATED);
            window.location.replace('/session-expired');
          }
        } else if (response.status === 401 || response.status === 403) {
          // Explicit auth failure from server → clear and redirect
          clearAuthStorage();
          isAuthenticatedRef.current = false;
          setAuthState(UNAUTHENTICATED);
          window.location.replace('/session-expired');
        }
      } catch {
        console.log('Server session check failed, relying on localStorage');
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sessionToken' || e.key === 'user') {
        isAuthenticatedRef.current = !!localStorage.getItem('user');
        checkAuth();
      }
    };

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
    clearAuthStorage();
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