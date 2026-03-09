"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiAlertCircle,
  FiUser,
  FiMenu,
  FiX,
  FiBookOpen,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiKey,
  FiTrendingUp,
} from "react-icons/fi";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: SidebarItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const getSidebarItems = (userRole: string): SidebarItem[] => {
  const adminItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiHome className="w-5 h-5" />,
      href: "/Admin/Inspection/management/analytics",
    },
    {
      id: "masterlist",
      label: "Business Registry",
      icon: <FiBookOpen className="w-5 h-5" />,
      children: [
        {
          id: "csv-manager",
          label: "Masterlist",
          icon: <FiBookOpen className="w-4 h-4" />,
          href: "/Admin/Inspection/management/masterlist",
        },
        {
          id: "review",
          label: "Scheduling",
          icon: <FiBookOpen className="w-4 h-4" />,
          href: "/Admin/Inspection/management/review",
        },
      ],
    },
    {
      id: "compliance-dashboard",
      label: "Compliance Notice",
      icon: <FiAlertCircle className="w-5 h-5" />,
      href: "/Admin/Compliance/Dashboard",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings className="w-5 h-5" />,
      href: "/module-2-inspection/notifCompliance",
    },
  ];

  const superAdminItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiHome className="w-5 h-5" />,
      href: "/SuperAdmin/Inspection/management/analytics",
    },
    {
      id: "business-registry",
      label: "Business Registry",
      icon: <FiBookOpen className="w-5 h-5" />,
      children: [
        {
          id: "masterlist",
          label: "Masterlist",
          icon: <FiBookOpen className="w-4 h-4" />,
          href: "/SuperAdmin/Inspection/management/masterlist",
        },
        {
          id: "scheduling",
          label: "Scheduling",
          icon: <FiBookOpen className="w-4 h-4" />,
          href: "/SuperAdmin/Inspection/management/review",
        },
      ],
    },
    {
      id: "compliance-notice",
      label: "Compliance Notice",
      icon: <FiAlertCircle className="w-5 h-5" />,
      href: "/SuperAdmin/Compliance/Dashboard",
    },
    {
      id: "user-management",
      label: "User Management",
      icon: <FiUser className="w-5 h-5" />,
      href: "/SuperAdmin/users",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings className="w-5 h-5" />,
      href: "/module-2-inspection/notifCompliance",
    },
  ];

  return userRole === 'super_admin' ? superAdminItems : adminItems;
};

const getCurrentPageLabel = (pathname: string, items: SidebarItem[]): string => {
  for (const item of items) {
    if (item.href === pathname) return item.label;
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) return child.label;
      }
    }
  }
  return "Dashboard";
};

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const pathname = usePathname();
  const [currentPageLabel, setCurrentPageLabel] = useState("Dashboard");

  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : { name: 'User Name', email: 'user@example.com', role: 'admin' };
    }
    return { name: 'User Name', email: 'user@example.com', role: 'admin' };
  };

  const userRole = getUserData().role;
  const sidebarItems = getSidebarItems(userRole);

  useEffect(() => {
    setCurrentPageLabel(getCurrentPageLabel(pathname, sidebarItems));
  }, [pathname, userRole]);

  useEffect(() => {
    const activeParent = sidebarItems.find(item =>
      item.children?.some(child => child.href === pathname)
    );
    if (activeParent && !expandedItems.includes(activeParent.id)) {
      setExpandedItems(prev => [...prev, activeParent.id]);
    }
  }, [pathname, sidebarItems]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      window.location.href = '/';
    }
  };

  const renderNavItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = item.href === pathname;
    const hasActiveChild = item.children?.some(child => child.href === pathname);

    return (
      <div key={item.id}>
        <Link
          href={item.href || "#"}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            } else {
              if (isMobile) setIsMobileMenuOpen(false);
              else setIsDesktopMenuOpen(false);
            }
          }}
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
            ${level > 0 ? "ml-6" : ""}
            ${
              isActive || hasActiveChild
                ? "bg-green-100 text-green-700 font-semibold shadow-sm"
                : "hover:bg-green-50 text-gray-700"
            }`}
        >
          <span
            className={`shrink-0 transition-colors ${
              isActive || hasActiveChild
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            {item.icon}
          </span>

          <span className="ml-3 text-sm tracking-wide font-medium">
            {item.label}
          </span>

          {hasChildren && (
            <span className="ml-auto">
              {isExpanded ? (
                <FiChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </span>
          )}
        </Link>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child =>
              renderNavItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-5 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link href="/Admin/Inspection/management/analytics">
              <div className="w-12 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer">
                BPLO
              </div>
            </Link>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-800 text-sm tracking-wide">
                Inspection Management System
              </span>
              <span className="text-xs text-gray-800">{currentPageLabel}</span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-green-500 hover:bg-green-600 transition"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5 text-white" />
            ) : (
              <FiMenu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl animate-slideIn p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 tracking-wide">
                  Navigation
                </h2>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map(item => renderNavItem(item))}
              </nav>

              <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{getUserData().name}</p>
                    <p className="text-xs text-gray-500">{getUserData().email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/SuperAdmin/change-password"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FiKey className="w-4 h-4 mr-3" />
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiLogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-16"></div>
      </>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/Admin/Inspection/management/analytics">
            <div className="w-12 h-9 bg-green-700 hover:bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer">
              BPLO
            </div>
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-800 text-sm tracking-wide">
              Inspection Management System
            </span>
            <span className="text-xs text-gray-800">{currentPageLabel}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
            className="p-2 rounded-xl bg-green-500 hover:bg-green-600 transition"
          >
            {isDesktopMenuOpen ? (
              <FiX className="w-5 h-5 text-white" />
            ) : (
              <FiMenu className="w-5 h-5 text-white" />
            )}
          </button>

          {isDesktopMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-2">
              {sidebarItems.map(item => renderNavItem(item))}

              <div className="border-t pt-4 mt-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{getUserData().name}</p>
                    <p className="text-xs text-gray-500">{getUserData().email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/SuperAdmin/change-password"
                    onClick={() => setIsDesktopMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FiKey className="w-4 h-4 mr-3" />
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiLogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-16"></div>
    </>
  );
}
