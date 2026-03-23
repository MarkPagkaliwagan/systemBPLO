"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PageLoaderProps {
  isVisible: boolean;
}

export default function PageLoader({ isVisible }: PageLoaderProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      // Start fade-out transition
      setFading(true);
      // Remove from DOM after transition completes
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
      setFading(false);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-green-900 transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20">
          <img
            src="/bplo-logo.png"
            alt="BPLO Logo"
            className="w-20 h-20 object-contain rounded-full"
            onError={(e) => {
              // Fallback if logo not found
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full ring-4 ring-white/30 animate-ping" />
      </div>

      {/* Title block */}
      <div className="text-center space-y-1">
        <p className="text-white font-semibold text-base tracking-wide">
          Business Permit and Licensing Office
        </p>
        <p className="text-white/60 text-sm">
          Inspection Management System
        </p>
      </div>

      {/* Spinner — same style as sidebar's LoadingModal */}
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-white" />

      {/* Loading label */}
      <p className="text-white/50 text-xs tracking-widest uppercase">
        Loading…
      </p>
    </div>
  );
}