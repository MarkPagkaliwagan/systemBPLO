"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiAlertCircle,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiAlertTriangle,
  FiDollarSign, // ✅ Peso icon
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
    icon: FiHome,
    href: "/module-3-notice/Dashboard",
  },
  {
    id: "aging-notice",
    label: "Aging Notice Masterlist",
    icon: FiAlertCircle,
    href: "/module-3-notice/Aging",
  },
  {
    id: "insert-violation",
    label: "Insert Violation",
    icon: FiAlertTriangle,
    href: "/module-3-notice/InsertViolation",
  },
  // ✅ NEW PAYMENT ITEM
  {
    id: "payment",
    label: "Payment",
    icon: FiDollarSign,
    href: "/module-3-notice/Payment",
  },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  // ================= MOBILE =================
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-green-800 text-white z-50 flex items-center justify-between px-4 shadow-md">
          <span className="font-semibold text-sm tracking-wide">
            System BPLO
          </span>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-green-700 transition"
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
                <div className="w-10 h-10 rounded-xl bg-green-800 text-white flex items-center justify-center font-bold">
                  SB
                </div>
                <span className="font-semibold text-green-800 text-lg">
                  System BPLO
                </span>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-1 flex-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                        active
                          ? "bg-green-100 text-green-800"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Back Button */}
              <div className="p-4 border-t border-green-100">
                <Link
                  href="/module-2-inspection/management/analytics"
                  className="flex items-center justify-center px-4 py-3 rounded-lg bg-green-800 text-white hover:bg-green-700 transition font-medium"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
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
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-green-100 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-green-800 text-white flex items-center justify-center font-bold shrink-0">
          SB
        </div>

        <span
          className={`whitespace-nowrap font-semibold text-green-800 text-lg transition-all duration-300 ${
            isCollapsed
              ? "opacity-0 -translate-x-3 pointer-events-none"
              : "opacity-100 translate-x-0"
          }`}
        >
          System BPLO
        </span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group overflow-hidden ${
                active
                  ? "bg-green-100 text-green-800 shadow-sm"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  active ? "text-green-800" : ""
                }`}
              />

              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 -translate-x-3 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ✅ SLIM SQUARE BACK BUTTON */}
      <div className="p-4 border-t border-green-100">
        <Link
          href="/module-2-inspection/management/analytics"
          className={`flex items-center justify-center transition-all duration-300 bg-green-800 text-white hover:bg-green-700 ${
            isCollapsed
              ? "w-12 h-12 rounded-xl"
              : "w-full h-12 rounded-xl hover:w-12"
          }`}
        >
          <FiArrowLeft className="w-4 h-4 shrink-0" />

          <span
            className={`ml-2 transition-all duration-300 ${
              isCollapsed
                ? "hidden"
                : "group-hover:hidden"
            }`}
          >
            {!isCollapsed && "Back to Main"}
          </span>
        </Link>
      </div>
    </div>
  );
}