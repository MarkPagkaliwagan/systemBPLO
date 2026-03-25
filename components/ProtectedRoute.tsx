// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import PageLoader from '../app/components/Pageloader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
  redirectTo?: string;
}

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
  requiredRole = 'staff',
  redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const roleOk =
    isAuthenticated && !!user?.role && hasRequiredRole(user.role, requiredRole);

  const isPending = isLoading || !isAuthenticated || !roleOk;

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

  return (
    <>
      <PageLoader isVisible={isPending} />
      {!isPending && children}
    </>
  );
}