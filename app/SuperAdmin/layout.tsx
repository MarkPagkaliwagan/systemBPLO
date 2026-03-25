"use client";

import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useInactivityTimeout();
  return <>{children}</>;
}