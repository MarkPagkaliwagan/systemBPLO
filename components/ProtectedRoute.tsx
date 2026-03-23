// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
  redirectTo?: string;
}

/**
 * Role hierarchy:
 *   admin (2) — full access    → /SuperAdmin/...
 *   staff (1) — limited access → /Admin/...
 *
 * A higher-ranked role automatically satisfies a lower requirement.
 * e.g. requiredRole="staff" also allows admin users through.
 *
 * Default is 'staff' (least-privileged) so all authenticated users
 * can access pages that don't explicitly require admin.
 * Pages under /SuperAdmin must explicitly pass requiredRole="admin".
 */
const ROLE_HIERARCHY: Record<string, number> = {
  staff: 1,
  admin: 2,
};

function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

function getDefaultRedirect(role?: string): string {
  if (role === 'admin') return '/SuperAdmin/Inspection/management/analytics';
  if (role === 'staff') return '/Admin/Inspection/management/analytics';
  return '/';
}

export default function ProtectedRoute({
  children,
  requiredRole = 'staff', // ← changed from 'admin' to 'staff'
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const roleOk =
    isAuthenticated && !!user?.role && hasRequiredRole(user.role, requiredRole);

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

  // Show spinner while loading or while a redirect is in-flight
  if (isLoading || !isAuthenticated || !roleOk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return <>{children}</>;
}