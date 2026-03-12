"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiBookOpen, FiAlertCircle } from "react-icons/fi";
import AddEventModal, { BusinessRecord } from "../Admin/Inspection/management/Modal/AddBusinessRecordModal;";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface MobileBottomNavProps {
  onAddEvent?: (event: BusinessRecord) => void;
}

const MobileBottomNav = ({ onAddEvent }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const router   = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : { role: 'admin' };
    }
    return { role: 'admin' };
  };

  const userRole = getUserData().role;

  const getNavItems = (): NavItem[] => {
    if (userRole === 'super_admin') {
      return [
        { id: "home",              label: "Home",              icon: <FiHome className="w-6 h-6" />,        href: "/SuperAdmin/Inspection/management/analytics" },
        { id: "scheduling",        label: "Scheduling",        icon: <FiBookOpen className="w-6 h-6" />,    href: "/SuperAdmin/Inspection/management/review"    },
        { id: "business-registry", label: "Business Registry", icon: <FiBookOpen className="w-6 h-6" />,    href: "/SuperAdmin/Inspection/management/masterlist"},
        { id: "compliance",        label: "Compliance",        icon: <FiAlertCircle className="w-6 h-6" />, href: "/SuperAdmin/Compliance/Dashboard"            },
      ];
    } else {
      return [
        { id: "home",              label: "Home",              icon: <FiHome className="w-6 h-6" />,        href: "/Admin/Inspection/management/analytics" },
        { id: "scheduling",        label: "Scheduling",        icon: <FiBookOpen className="w-6 h-6" />,    href: "/Admin/Inspection/management/review"    },
        { id: "business-registry", label: "Business Registry", icon: <FiBookOpen className="w-6 h-6" />,    href: "/Admin/Inspection/management/masterlist"},
        { id: "compliance",        label: "Compliance",        icon: <FiAlertCircle className="w-6 h-6" />, href: "/Admin/Compliance/Dashboard"            },
      ];
    }
  };

  const navItems = getNavItems();

 const getActiveTab = (): string => {
  if (pathname.includes("/Compliance")) return "compliance";  // Check Compliance first
  if (pathname.includes("/analytics") || pathname.includes("/Dashboard")) return "home";
  if (pathname.includes("/review")) return "scheduling";
  if (pathname.includes("/masterlist")) return "business-registry";
  if (pathname.includes("/notifCompliance")) return "settings";
  return "home";
};

  const activeTab = getActiveTab();

  const renderNavItem = (item: NavItem) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        className="flex flex-col items-center flex-1 transition-all active:scale-90"
        onClick={() => router.push(item.href)}
      >
        <div className={`transition-colors ${isActive ? "text-green-800" : "text-gray-400 group-hover:text-white"}`}>
          {item.icon}
        </div>
        <span className={`text-[10px] font-medium mt-1 transition-colors ${isActive ? 'text-green-800' : 'text-gray-400 group-hover:text-white'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.08)] md:hidden">
        {navItems.map((item, index) => {
          if (index === 1) {
            return (
              <React.Fragment key={`nav-group-${index}`}>
                {renderNavItem(item)}

                {/* Center + button */}
                <div className="relative flex-1 flex justify-center -top-6">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center shadow-xl shadow-green-200 border-[6px] border-white text-white active:scale-95 transition-transform"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </React.Fragment>
            );
          }
          return renderNavItem(item);
        })}
      </nav>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(event: BusinessRecord) => {
          onAddEvent?.(event);
          setModalOpen(false);
        }}
      />
    </>
  );
};

export default MobileBottomNav;