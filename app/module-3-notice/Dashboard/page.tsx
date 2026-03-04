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

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FiHome className="w-4 h-4" />,
    href: "/module-2-inspection/management/analytics",
  },
  {
    id: "masterlist",
    label: "Masterlist",
    icon: <FiBookOpen className="w-4 h-4" />,
    children: [
      {
        id: "csv-manager",
        label: "CSV Manager",
        icon: <FiBookOpen className="w-3 h-3" />,
        href: "/module-2-inspection/management/analytics/masterlist",
      },
      {
        id: "review",
        label: "Review",
        icon: <FiBookOpen className="w-3 h-3" />,
        href: "/module-2-inspection/management/analytics/review",
      },
    ],
  },
  {
    id: "notifCompliance",
    label: "Compliance Notice",
    icon: <FiAlertCircle className="w-4 h-4" />,
    children: [
      {
        id: "compliance-dashboard",
        label: "Dashboard",
        icon: <FiBookOpen className="w-3 h-3" />,
        href: "/module-2-inspection/dashboard",
      },
      {
        id: "compliance-aging",
        label: "Aging",
        icon: <FiBookOpen className="w-3 h-3" />,
        href: "/module-2-inspection/aging",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <FiSettings className="w-4 h-4" />,
    href: "/module-2-inspection/notifCompliance",
  },
];

// Helper function to find current page label
const getCurrentPageLabel = (pathname: string, items: SidebarItem[]): string => {
  for (const item of items) {
    if (item.href === pathname) {
      return item.label;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) {
          return child.label;
        }
      }
    }
  }
  return "Dashboard"; // Default fallback
};

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  setIsMobileMenuOpen,
  isMobile,
  isMobileMenuOpen,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const pathname = usePathname();
  const [currentPageLabel, setCurrentPageLabel] = useState("Dashboard");

  // Update current page label when pathname changes
  useEffect(() => {
    setCurrentPageLabel(getCurrentPageLabel(pathname, sidebarItems));
  }, [pathname]);

  // Auto-expand parent items if child is active
  useEffect(() => {
    const activeParent = sidebarItems.find(item => 
      item.children?.some(child => child.href === pathname)
    );
    if (activeParent && !expandedItems.includes(activeParent.id)) {
      setExpandedItems(prev => [...prev, activeParent.id]);
    }
  }, [pathname]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderNavItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = item.href === pathname;
    const hasActiveChild = item.children?.some(child => child.href === pathname);

    return (
      <div key={item.id} className="relative">
        <Link
          href={item.href || '#'}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            } else {
              // Close menu when navigating
              if (isMobile) {
                setIsMobileMenuOpen(false);
              } else {
                setIsDesktopMenuOpen(false);
              }
            }
          }}
          className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 hover:bg-green-50 group cursor-pointer ${
            level > 0 ? 'ml-3 sm:ml-4' : ''
          } ${isActive || hasActiveChild ? 'bg-green-50 border-l-3 sm:border-l-4 border-green-500' : ''}`}
        >
          <span className={`transition-colors shrink-0 ${
            isActive || hasActiveChild ? 'text-green-600' : 'text-gray-600 group-hover:text-green-600'
          }`}>
            {item.icon}
          </span>
          <span className={`ml-2 sm:ml-3 text-gray-700 font-medium transition-colors text-sm sm:text-base ${
            isActive || hasActiveChild ? 'text-green-600' : 'group-hover:text-green-600'
          }`}>
            {item.label}
          </span>
          {hasChildren && (
            <span className="ml-auto">
              {isExpanded ? (
                <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              ) : (
                <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              )}
            </span>
          )}
        </Link>

        {/* Sub-items */}
        {hasChildren && isExpanded && (
          <div className="ml-3 sm:ml-4 mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-3 sm:px-4">
          {/* Left side - Logo and Current Page */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              LOGO
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                System BPLO
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">
                {currentPageLabel}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <FiMenu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      LOGO
                    </div>
                    <span className="font-semibold text-gray-800 text-sm sm:text-base">
                      System BPLO
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <nav className="p-3 sm:p-4">
                <ul className="space-y-1 sm:space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      {renderNavItem(item)}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* User Info at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <FiUser className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-xs font-medium text-gray-800">User Name</p>
                    <p className="text-xs text-gray-500 hidden sm:block">user@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add top padding to prevent content from being hidden under the fixed header */}
        <div className="h-14 sm:h-16"></div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-3 sm:px-4 shadow-sm">
        {/* Left side - Logo and Current Page */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
            LOGO
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-xs sm:text-sm">
              System BPLO
            </span>
            <span className="text-xs text-gray-500 hidden sm:block">
              {currentPageLabel}
            </span>
          </div>
        </div>

        {/* Right side - Hamburger Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
            className="p-1.5 sm:p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
          >
            {isDesktopMenuOpen ? (
              <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <FiMenu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </button>

          {/* Desktop Dropdown Menu */}
          {isDesktopMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    LOGO
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    System BPLO
                  </span>
                </div>
              </div>

              <nav className="p-3 sm:p-4">
                <ul className="space-y-1 sm:space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      {renderNavItem(item)}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* User Info at Bottom */}
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <FiUser className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-xs font-medium text-gray-800">User Name</p>
                    <p className="text-xs text-gray-500 hidden sm:block">user@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add top padding to prevent content from being hidden under the fixed header */}
      <div className="h-14 sm:h-16"></div>
    </>
  );
}