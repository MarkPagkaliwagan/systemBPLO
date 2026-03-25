"use client";

import { useEffect, useRef, useCallback } from "react";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove", 
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
];

function clearAuthStorage() {
  localStorage.removeItem("user");
  localStorage.removeItem("sessionExpiry");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("sessionExpiry");
}

export function useInactivityTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExpiry = useCallback(async () => {
    clearAuthStorage();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // best-effort — even if the API call fails, we still redirect
    }
    window.location.replace("/session-expired");
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleExpiry, TIMEOUT_MS);
  }, [handleExpiry]);

  useEffect(() => {
    // Start timer on mount
    resetTimer();

    // Reset on any user activity
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    // Reset when user comes back to the tab
    const handleVisibility = () => {
      if (!document.hidden) resetTimer();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [resetTimer]);
}