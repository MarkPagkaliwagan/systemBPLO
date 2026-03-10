"use client";

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | string;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-200 text-gray-800",
    admin: "bg-green-100 text-green-800",
    super_admin: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className || ''}`}>
      {children}
    </span>
  );
}
