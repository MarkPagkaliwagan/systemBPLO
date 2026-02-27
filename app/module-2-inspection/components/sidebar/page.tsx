"use client";

import { useState } from "react";
import Link from "next/link";
import { FiHome, FiAlertCircle, FiUser, FiMenu, FiX, FiBookOpen, FiSettings } from "react-icons/fi";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FiHome className="w-5 h-5" />,
    href: "/module-2-inspection/management/analytics"
  },
  {
    id: "masterlist",
    label: "Masterlist",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/module-2-inspection/masterlist"
  },
  {
    id: "notifCompliance",
    label: "Compliance Notification",
    icon: <FiAlertCircle className="w-5 h-5" />,
    href: "/module-3-notice/Dashboard"
  },
  {
    id: "settings",
    label: "Settings",
    icon: <FiSettings className="w-5 h-5" />,
    href: "/module-2-inspection/notifCompliance"
  }
];

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 shadow-lg ${isCollapsed ? 'w-32' : 'w-80'  // Wider when collapsed
      }`}>
      {/* Header with Logo */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              LOGO
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                LOGO
              </div>
              <span className="font-semibold text-gray-800">System BPLO</span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      
      {/* Navigation Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <span className="text-gray-600 group-hover:text-green-600 transition-colors">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-gray-700 group-hover:text-green-600 transition-colors font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">User Name</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}