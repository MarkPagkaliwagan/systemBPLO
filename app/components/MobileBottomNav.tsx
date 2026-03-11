"use client";

import { FiHome, FiFile, FiAlertCircle, FiSettings } from "react-icons/fi";

interface MobileBottomNavProps {
  activeItem?: string;
}

export default function MobileBottomNav({ activeItem }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
      <button className="flex flex-col items-center flex-1 transition-all active:scale-90">
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9-7-9 7-9 7-9 9-7zm0-2v2a2 2 0 012 2v10a2 2 0 01-2-2H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2z"/>
        </svg>
        <span className="text-[10px] font-bold text-green-500 mt-1">HOME</span>
      </button>

      <button className="flex flex-col items-center flex-1 text-gray-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z"/>
          <path d="M8 12h8M8 6h8"/>
        </svg>
        <span className="text-[10px] font-medium mt-1">MASTERLIST</span>
      </button>

      <div className="relative flex-1 flex justify-center -top-6">
        <button className="w-16 h-16 bg-[#00C853] rounded-full flex items-center justify-center shadow-xl shadow-green-200 border-[6px] border-white text-white active:scale-95 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <button className="flex flex-col items-center flex-1 text-gray-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a4 4 0 004 4h10a4 4 0 004-4 4 4 0 00-4-4H4a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4 4 4 0 00-4-4z"/>
        </svg>
        <span className="text-[10px] font-medium mt-1">COMPLIANCE</span>
      </button>

      <button className="flex flex-col items-center flex-1 text-gray-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.31 0 1.756-2.924-3.31-3.31S8.75 1.406 8.325 4.317c-.426 1.756-2.924 1.756-3.31 0-1.756 2.924-3.31 3.31S11.9 6.228 10.325 4.317zM15.75 9a.75.75 0 01-1.5 0v2.5a.75.75 0 001.5 0v2.5a.75.75 0 001.5 0V9a.75.75 0 01-1.5 0z"/>
          <path d="M16.5 13.5h-9a.75.75 0 00-.75.75v2.25a.75.75 0 00.75.75h9a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75z"/>
        </svg>
        <span className="text-[10px] font-medium mt-1">SETTINGS</span>
      </button>
    </nav>
  );
}
