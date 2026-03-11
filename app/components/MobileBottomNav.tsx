"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiBookOpen, FiAlertCircle, FiUser, FiUsers } from "react-icons/fi";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

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
        {
          id: "home",
          label: "Home",
          icon: <FiHome className="w-6 h-6" />,
          href: "/SuperAdmin/Inspection/management/analytics",
        },
        {
          id: "scheduling",
          label: "Scheduling",
          icon: <FiBookOpen className="w-6 h-6" />,
          href: "/SuperAdmin/Inspection/management/review",
        },
        {
          id: "business-registry",
          label: "Business Registry",
          icon: <FiBookOpen className="w-6 h-6" />,
          href: "/SuperAdmin/Inspection/management/masterlist",
        },
        {
          id: "compliance",
          label: "Compliance",
          icon: <FiAlertCircle className="w-6 h-6" />,
          href: "/SuperAdmin/Compliance/Dashboard",
        },
      ];
    } else {
      return [
        {
          id: "home",
          label: "Home",
          icon: <FiHome className="w-6 h-6" />,
          href: "/Admin/Inspection/management/analytics",
        },
        {
          id: "scheduling",
          label: "Scheduling",
          icon: <FiBookOpen className="w-6 h-6" />,
          href: "/Admin/Inspection/management/review",
        },
        {
          id: "business-registry",
          label: "Business Registry",
          icon: <FiBookOpen className="w-6 h-6" />,
          href: "/Admin/Inspection/management/masterlist",
        },
        {
          id: "compliance",
          label: "Compliance",
          icon: <FiAlertCircle className="w-6 h-6" />,
          href: "/Admin/Compliance/Dashboard",
        },
      ];
    }
  };

  const navItems = getNavItems();

  const getActiveTab = (): string => {
    if (pathname.includes("/analytics") || pathname.includes("/Dashboard")) return "home";
    if (pathname.includes("/review")) return "scheduling";
    if (pathname.includes("/masterlist")) return "business-registry";
    if (pathname.includes("/Compliance")) return "compliance";
    if (pathname.includes("/notifCompliance")) return "settings";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = activeTab === item.id;
    
    return (
      <button 
        key={item.id} 
        className="flex flex-col items-center flex-1 transition-all active:scale-90"
        onClick={() => handleNavClick(item.href)}
      >
        <div className={isActive ? "text-green-500" : "text-gray-400"}>
          {item.icon}
        </div>
        <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.08)] md:hidden">
      {navItems.map((item, index) => {
        // Insert central action button after the second item (index 1)
        if (index === 1) {
          return (
            <React.Fragment key={`nav-${index}`}>
              {renderNavItem(item, index)}
              <div key="action-button" className="relative flex-1 flex justify-center -top-6">
                <button className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center shadow-xl shadow-green-200 border-[6px] border-white text-white active:scale-95 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              </div>
            </React.Fragment>
          );
        }
        return renderNavItem(item, index);
      })}
    </nav>
  );
};

export default MobileBottomNav;
