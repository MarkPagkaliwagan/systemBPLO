import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'admin',
  redirectTo 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (!hasRole(requiredRole)) {
      // Redirect based on current user role
      if (user?.role === 'admin') {
        router.push('/Admin/Inspection/management/analytics');
      } else if (user?.role === 'super_admin') {
        router.push('/SuperAdmin/users');
      } else {
        router.push('/');
      }
      return;
    }
  }, [isLoading, isAuthenticated, hasRole, user, router, requiredRole, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole(requiredRole)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
