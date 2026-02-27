"use client";

import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
 
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
 
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LOGO
            </div>
            <span className="font-semibold text-gray-800 text-sm">System BPLO</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
 
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                    LOGO
                  </div>
                  <span className="font-semibold text-gray-800">System BPLO</span>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-gray-600 group-hover:text-green-600 transition-colors">
                          {item.icon}
                        </span>
                        <span className="text-gray-700 group-hover:text-green-600 transition-colors font-medium">
                          {item.label}
                        </span>
                      </Link>
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
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 shadow-lg ${isCollapsed ? 'w-15' : 'w-80'  // Changed from w-64 to w-80 (320px)
      }`}>
      {/* Header with Logo */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex flex-col items-center">
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