"use client";

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
          id: "dashboard",
          label: "Dashboard",
          icon: <FiHome className="w-6 h-6" />,
          href: "/SuperAdmin/Inspection/management/analytics",
        },
        {
          id: "masterlist",
          label: "Inspections",
          icon: <FiBookOpen className="w-6 h-6" />,
          href: "/SuperAdmin/Inspection/management/masterlist",
        },
        {
          id: "compliance",
          label: "Compliance",
          icon: <FiAlertCircle className="w-6 h-6" />,
          href: "/SuperAdmin/Compliance/Dashboard",
        },
        {
          id: "users",
          label: "Users",
          icon: <FiUsers className="w-6 h-6" />,
          href: "/SuperAdmin/users",
        },
        {
          id: "settings",
          label: "Profile",
          icon: <FiUser className="w-6 h-6" />,
          href: "/module-2-inspection/notifCompliance",
        },
      ];
    } else {
      return [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <FiHome className="w-6 h-6" />,
          href: "/Admin/Inspection/management/analytics",
        },
        {
          id: "masterlist",
          label: "Inspections",
          icon: <FiBookOpen className="w-6 h-6" />,
          href: "/Admin/Inspection/management/masterlist",
        },
        {
          id: "compliance",
          label: "Compliance",
          icon: <FiAlertCircle className="w-6 h-6" />,
          href: "/Admin/Compliance/Dashboard",
        },
        {
          id: "settings",
          label: "Profile",
          icon: <FiUser className="w-6 h-6" />,
          href: "/module-2-inspection/notifCompliance",
        },
      ];
    }
  };

  const navItems = getNavItems();

  const getActiveTab = (): string => {
    if (pathname.includes("/analytics") || pathname.includes("/Dashboard")) return "dashboard";
    if (pathname.includes("/masterlist")) return "masterlist";
    if (pathname.includes("/Compliance")) return "compliance";
    if (pathname.includes("/users")) return "users";
    if (pathname.includes("/settings") || pathname.includes("/notifCompliance")) return "settings";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = activeTab === item.id;
    const isCentralButton = userRole === 'super_admin' ? index === 2 : index === 1;
    
    if (isCentralButton && userRole === 'super_admin') {
      // Central action button for SuperAdmin (5 items total)
      return (
        <div key={item.id} className="relative flex-1 flex justify-center -top-6">
          <button className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center shadow-xl shadow-green-200 border-[6px] border-white text-white active:scale-95 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      );
    }

    if (isCentralButton && userRole === 'admin') {
      // Central action button for Admin (4 items total)
      return (
        <div key="action-button" className="relative flex-1 flex justify-center -top-6">
          <button className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center shadow-xl shadow-green-200 border-[6px] border-white text-white active:scale-95 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      );
    }

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
      {navItems.map((item, index) => renderNavItem(item, index))}
    </nav>
  );
};

export default MobileBottomNav;
