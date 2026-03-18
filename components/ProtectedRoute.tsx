// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  redirectTo?: string;
}

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 1,
  super_admin: 2,
};

function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

function getDefaultRedirect(role?: string): string {
  if (role === 'admin') return '/Admin/Inspection/management/analytics';
  if (role === 'super_admin') return '/SuperAdmin/users';
  return '/';
}

export default function ProtectedRoute({
  children,
  requiredRole = 'admin',
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const roleOk = isAuthenticated && !!user?.role && hasRequiredRole(user.role, requiredRole);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo ?? '/');
      return;
    }

    if (!roleOk) {
      router.replace(redirectTo ?? getDefaultRedirect(user?.role));
    }
  }, [isLoading, isAuthenticated, roleOk, user?.role, router, redirectTo]);

  // Show spinner while loading OR while redirect is in-flight
  if (isLoading || !isAuthenticated || !roleOk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return <>{children}</>;
}