"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiBookOpen, FiAlertCircle } from "react-icons/fi";
import AddEventModal from "../Admin/Inspection/management/Modal/AddBusinessRecordModal";
import ReviewModal, { BusinessRecord } from "../Admin/Inspection/management/Modal/reviewModal";
import ConfirmScheduleModal from "../Admin/Inspection/management/Modal/Confirmschedulemodal";
import { supabase } from "@/lib/supabaseClient";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface MobileBottomNavProps {
  onAddEvent?: (event: BusinessRecord) => void;
}

const LoadingModal = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-5 shadow-2xl">
        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
        <p className="text-sm font-medium text-gray-700">Loading ...</p>
      </div>
    </div>
  );
};

const MobileBottomNav = ({ onAddEvent }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // ── Lifted state: lives here at nav level, outside AddEventModal ──────────
  const [pendingRecord, setPendingRecord] = useState<BusinessRecord | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setIsPageLoading(false);
  }, [pathname]);

  const getUserData = () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : { role: "admin" };
    }
    return { role: "admin" };
  };

  const userRole = getUserData().role;

  const getNavItems = (): NavItem[] => {
    if (userRole === "admin") {
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
    if (pathname.includes("/Compliance")) return "compliance";
    if (pathname.includes("/analytics") || pathname.includes("/Dashboard")) return "home";
    if (pathname.includes("/review")) return "scheduling";
    if (pathname.includes("/masterlist")) return "business-registry";
    if (pathname.includes("/notifCompliance")) return "settings";
    return "home";
  };

  const activeTab = getActiveTab();

  // ── Called by AddEventModal when save is done — close add form, show confirm
  const handleRequestSchedule = (record: BusinessRecord) => {
    setPendingRecord(record);
    setModalOpen(false);      // ✅ close add form FIRST — clears its z-stack
    setShowConfirm(true);     // then show confirm at THIS level
  };

  // ── Confirm "Yes, Schedule Now" ───────────────────────────────────────────
  const handleConfirmYes = () => {
    setShowConfirm(false);
    setShowReview(true);      // ✅ ReviewModal renders here, no z-index conflicts
  };

  // ── Confirm "No, Skip" ────────────────────────────────────────────────────
  const handleConfirmSkip = () => {
    setShowConfirm(false);
    setPendingRecord(null);
  };

  // ── ReviewModal save ──────────────────────────────────────────────────────
  const handleReviewSave = async (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
    photoUrl?: string;
    reviewedBy?: string;
  }) => {
    if (!pendingRecord) return;
    const updates: Record<string, any> = {
      review_action: reviewData.reviewActions.join(", ") || null,
      violation: reviewData.violations.join(", ") || null,
      status: reviewData.reviewActions[reviewData.reviewActions.length - 1]?.toLowerCase().replace(/ /g, "_") ?? null,
      review_date: new Date().toISOString(),
      reviewed_by: reviewData.reviewedBy ?? null,
      assigned_inspector: reviewData.assignedInspector ?? null,
      scheduled_date: reviewData.scheduledDate ?? null,
      schedule_time: reviewData.scheduledTime ?? null,
      latitude: reviewData.location?.lat?.toString() ?? null,
      longitude: reviewData.location?.lng?.toString() ?? null,
      accuracy: reviewData.location?.accuracy?.toString() ?? null,
      photo: reviewData.photoUrl ?? null,
    };
    await supabase
      .from("business_records")
      .update(updates)
      .eq("Business Identification Number", pendingRecord["Business Identification Number"]);
    setShowReview(false);
    setPendingRecord(null);
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        className="flex flex-col items-center flex-1 transition-all active:scale-90"
        onClick={() => {
          if (item.href !== pathname) setIsPageLoading(true);
          router.push(item.href);
        }}
      >
        <div className={`transition-colors ${isActive ? "text-green-800" : "text-gray-400"}`}>
          {item.icon}
        </div>
        <span className={`text-[10px] font-medium mt-1 transition-colors ${isActive ? "text-green-800" : "text-gray-400"}`}>
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
                <div className="relative flex-1 flex justify-center -top-6">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center shadow-xl shadow-green-200 border-[6px] border-white text-white active:scale-95 transition-transform"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </React.Fragment>
            );
          }
          return renderNavItem(item);
        })}
      </nav>

      {/* Loading Modal */}
      <LoadingModal isOpen={isPageLoading} />

      {/* ── Add Event Modal ── no more ConfirmSchedule/Review inside it ───── */}
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(record: BusinessRecord) => {
          onAddEvent?.(record);
          // Don't close here — AddEventModal will call onRequestSchedule after save
        }}
        onRequestSchedule={handleRequestSchedule}  // ✅ new prop
      />

      {/* ── ConfirmScheduleModal — at nav level, no z-stack conflicts ──────── */}
      <ConfirmScheduleModal
        isOpen={showConfirm}
        businessName={pendingRecord?.["Business Name"] ?? ""}
        onConfirm={handleConfirmYes}
        onSkip={handleConfirmSkip}
      />

      {/* ── ReviewModal — at nav level, renders exactly like analytics ──────── */}
      {showReview && pendingRecord && (
        <ReviewModal
          selectedRow={pendingRecord}
          showReviewModal={true}
          isMobile={true}
          onClose={() => { setShowReview(false); setPendingRecord(null); }}
          onSave={handleReviewSave}
          onRecordUpdated={(updated) => setPendingRecord(updated as BusinessRecord)}
          onRecordDeleted={() => { setShowReview(false); setPendingRecord(null); }}
        />
      )}
    </>
  );
};

export default MobileBottomNav;