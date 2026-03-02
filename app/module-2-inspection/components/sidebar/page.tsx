"use client";

import { useState } from "react";
import Link from "next/link";
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
    icon: <FiHome className="w-5 h-5" />,
    href: "/module-2-inspection/management/analytics",
  },
  {
    id: "masterlist",
    label: "Masterlist",
    icon: <FiBookOpen className="w-5 h-5" />,
    children: [
      {
        id: "csv-manager",
        label: "CSV Manager",
        icon: <FiBookOpen className="w-4 h-4" />,
        href: "/module-2-inspection/management/analytics/masterlist",
      },
      {
        id: "review",
        label: "Review",
        icon: <FiBookOpen className="w-4 h-4" />,
        href: "/module-2-inspection/management/analytics/review",
      },
    ],
  },
  {
    id: "notifCompliance",
    label: "Compliance Notification",
    icon: <FiAlertCircle className="w-5 h-5" />,
    href: "/module-3-notice/Dashboard",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/module-2-inspection/notifCompliance",
  },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = false; // You can add active state logic here

    if (isMobile) {
      return (
        <div key={item.id}>
          <div
            className={`flex items-center p-3 rounded-lg hover:bg-green-50 transition group cursor-pointer ${
              level > 0 ? 'ml-4' : ''
            }`}
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.id);
              } else if (item.href) {
                // Navigate and close mobile menu
                window.location.href = item.href;
                setIsMobileMenuOpen(false);
              }
            }}
          >
            <span className="text-gray-600 group-hover:text-green-600 transition-colors shrink-0">
              {item.icon}
            </span>
            <span className="ml-3 text-gray-700 group-hover:text-green-600 font-medium">
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
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {item.children?.map(child => renderSidebarItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.id}>
        <Link
          href={item.href || '#'}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            }
          }}
          className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-green-50 group overflow-hidden cursor-pointer ${
            level > 0 ? 'ml-4' : ''
          }`}
        >
          {/* Icon */}
          <span className="text-gray-600 group-hover:text-green-600 transition-colors shrink-0">
            {item.icon}
          </span>

          {/* Label */}
          <span
            className={`ml-3 whitespace-nowrap text-gray-700 group-hover:text-green-600 font-medium transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 -translate-x-2.5"
                : "opacity-100 translate-x-0"
            }`}
          >
            {item.label}
          </span>

          {/* Chevron for expandable items */}
          {hasChildren && !isCollapsed && (
            <span className="ml-auto transition-transform duration-300">
              {isExpanded ? (
                <FiChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </span>
          )}
        </Link>

        {/* Sub-items */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LOGO
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              System BPLO
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                    LOGO
                  </div>
                  <span className="font-semibold text-gray-800">
                    System BPLO
                  </span>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      {renderSidebarItem(item)}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 shadow-lg ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center p-6 border-b border-gray-200 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
            LOGO
          </div>

          {/* Smooth label */}
          <span
            className={`whitespace-nowrap font-semibold text-gray-800 transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 -translate-x-2.5"
                : "opacity-100 translate-x-0"
            }`}
          >
            System BPLO
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              {renderSidebarItem(item)}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
            <FiUser className="w-4 h-4 text-gray-600" />
          </div>

          <div
            className={`transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 -translate-x-2.5"
                : "opacity-100 translate-x-0"
            }`}
          >
            <p className="text-sm font-medium text-gray-800">User Name</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}