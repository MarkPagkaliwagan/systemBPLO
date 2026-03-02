"use client";

import Link from "next/link";
import {
  FiHome,
  FiAlertCircle,
  FiMenu,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const sidebarItems = [
  {
    id: "dashboard",
    label: "Compliance Dashboard",
    icon: <FiHome className="w-5 h-5" />,
    href: "/module-3-notice/Dashboard",
  },
  {
    id: "aging",
    label: "Aging Notice Masterlist",
    icon: <FiAlertCircle className="w-5 h-5" />,
    href: "/module-3-notice/Aging",
  },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {

  // ================= MOBILE =================
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-green-800 text-white z-50 flex items-center justify-between px-4 shadow-md">
          <span className="font-semibold text-sm">
            System BPLO
          </span>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-green-800 transition"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo */}
              <div className="p-6 border-b border-green-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold">
                  SB
                </div>
                <span className="font-semibold text-green-800">
                  System BPLO
                </span>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2 flex-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                  >
                    {item.icon}
                    <span className="font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Back Button */}
              <div className="p-4 border-t border-green-100">
                <Link
                  href="/module-2-inspection/management/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-700 text-white hover:bg-green-700 transition"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Main
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ================= DESKTOP =================
  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`fixed left-0 top-0 h-screen bg-white border-r border-green-100 transition-all duration-300 ease-in-out z-50 shadow-md flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-6 border-b border-green-100 overflow-hidden">
        <div className="w-10 h-10 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold shrink-0">
          SB
        </div>

        <span
          className={`whitespace-nowrap font-semibold text-green-800 transition-all duration-300 ${
            isCollapsed
              ? "opacity-0 -translate-x-3 pointer-events-none"
              : "opacity-100 translate-x-0"
          }`}
        >
          System BPLO
        </span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group overflow-hidden"
          >
            <span className="group-hover:text-green-700 transition shrink-0">
              {item.icon}
            </span>

            <span
              className={`whitespace-nowrap font-medium transition-all duration-300 ${
                isCollapsed
                  ? "opacity-0 -translate-x-3 pointer-events-none"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Back Button Bottom */}
      <div className="p-4 border-t border-green-100">
        <Link
          href="/module-2-inspection/management/analytics"
          className="flex items-center gap-3 p-3 rounded-lg bg-green-800 text-white hover:bg-green-700 transition overflow-hidden"
        >
          <FiArrowLeft className="w-4 h-4 shrink-0" />

          <span
            className={`whitespace-nowrap transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 -translate-x-3 pointer-events-none"
                : "opacity-100 translate-x-0"
            }`}
          >
            Back to Main
          </span>
        </Link>
      </div>
    </div>
  );
}