"use client";

import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useInactivityTimeout();
  return <>{children}</>;
}