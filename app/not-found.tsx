"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SessionExpiredPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      handleLogin();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleLogin() {
    sessionStorage.clear();
    const authKeys = [
      "token", "authToken", "accessToken", "refreshToken",
      "sessionId", "user", "userData", "isLoggedIn", "sessionExpiry",
    ];
    authKeys.forEach((k) => localStorage.removeItem(k));
    router.replace("/");
  }

  return (
    <div className="page">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }

        .page {
          font-family: Arial, sans-serif;
          background: #166534;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
        }

        .logo-wrap {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .office-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.45;
          margin-bottom: 5px;
        }

        .office-sub {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        /* Clock icon ring animation */
        .icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.96); }
        }

        h1 {
          font-size: clamp(1.3rem, 3.5vw, 1.75rem);
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .sub-msg {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          max-width: 300px;
          margin: 0 auto 28px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: #ffffff;
          color: #166534;
          font-family: Arial, sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 13px 36px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          min-width: 180px;
          flex-shrink: 0;
        }

        .btn:hover { background: #f0fdf4; }
        .btn:active { transform: scale(0.98); background: #dcfce7; }

        .countdown {
          margin-top: 14px;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
        }

        .footer-note {
          margin-top: 12px;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @media (max-width: 480px) {
          .logo-wrap { width: 96px; height: 96px; }
          .office-name { font-size: 0.82rem; }
          .sub-msg { font-size: 0.8rem; }
          .btn { width: 100%; max-width: 280px; }
        }

        @media (max-height: 640px) {
          .logo-wrap { width: 80px; height: 80px; margin-bottom: 12px; }
          .office-sub { margin-bottom: 20px; }
          .icon-wrap { width: 52px; height: 52px; margin-bottom: 14px; }
          h1 { font-size: 1.2rem; }
          .sub-msg { font-size: 0.78rem; margin-bottom: 20px; }
        }
      `}</style>

      <div className="logo-wrap">
        <Image
          src="/bplo-logo.png"
          alt="BPLO Logo"
          width={104}
          height={104}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      <div className="office-name">Business Permit &amp; Licensing Office</div>
      <div className="office-sub">City of San Pablo</div>

      {/* Animated clock icon */}
      <div className="icon-wrap">
        <svg
          width={32} height={32}
          fill="none" stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <h1>Session Expired</h1>
      <p className="sub-msg">
        Your session has timed out due to inactivity.<br />
        Please log in again to continue.
      </p>

      <button className="btn" onClick={handleLogin}>
        <svg
          width={15} height={15}
          fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Back to Login
      </button>

      <div className="countdown">Redirecting in {countdown}s…</div>
      <div className="footer-note">Access has expired or been revoked</div>
    </div>
  );
}