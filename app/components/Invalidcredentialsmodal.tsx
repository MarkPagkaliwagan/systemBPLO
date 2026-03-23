"use client";

import { useEffect, useRef } from "react";
import { ShieldAlert, X, AlertCircle } from "lucide-react";

interface InvalidCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function InvalidCredentialsModal({
  isOpen,
  onClose,
  message = "The email or password you entered is incorrect. Please double-check your credentials and try again.",
}: InvalidCredentialsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .ic-backdrop { animation: backdropFadeIn 0.2s ease both; }
        .ic-card     { animation: modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
        .ic-icon     { animation: iconPulse 0.5s ease 0.25s both; }
      `}</style>

      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="ic-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(17,24,39,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      >
        <div className="ic-card bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

          {/* Top gradient bar */}
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #dc2626, #f87171, #fca5a5)" }}
          />

          <div className="p-6">
            {/* Close button */}
            <div className="flex justify-end mb-1">
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center mb-5">
              <div
                className="ic-icon w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #fecaca, #fca5a5)" }}
                >
                  <ShieldAlert size={22} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Invalid Credentials
              </h3>
              <p className="text-xs font-medium text-red-500 tracking-wide uppercase">
                Authentication Failed
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100 mb-5" />

            {/* Message box */}
            <div
              className="flex gap-3 rounded-xl p-4 mb-5"
              style={{ backgroundColor: "#fef9f9", border: "1px solid #fecaca" }}
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full text-white text-sm font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #166534, #15803d)",
                boxShadow: "0 4px 14px rgba(22,101,52,0.35)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 14px rgba(22,101,52,0.35)";
              }}
            >
              Try Again
            </button>

            {/* Hint */}
            <p className="text-center text-xs text-gray-400 mt-3">
              Forgot your password?{" "}
              <a
                href="/forgot-password"
                className="text-green-700 font-semibold hover:underline"
              >
                Reset it here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}