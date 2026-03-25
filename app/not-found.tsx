"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SessionExpiredPage() {
  const router = useRouter();

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

        .page {
          font-family: Arial, sans-serif;
          background: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }

        .logo-wrap {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          margin-bottom: 20px;
        }

        .office-name {
          font-size: 1rem;
          font-weight: 700;
          color: #166534;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .office-sub {
          font-size: 0.75rem;
          color: #9ca3af;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 48px;
        }

        .icon-wrap {
          width: 56px;
          height: 56px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .badge {
          display: inline-block;
          background: #fef9c3;
          color: #854d0e;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 6px;
          margin-bottom: 14px;
        }

        h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        p {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.7;
          max-width: 340px;
          margin: 0 auto 36px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #166534;
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 14px 40px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          min-width: 180px;
        }

        .btn:hover { background: #14532d; }
        .btn:active { background: #052e16; }

        .footer-note {
          margin-top: 28px;
          font-size: 0.72rem;
          color: #d1d5db;
          letter-spacing: 0.02em;
        }

        @media (max-width: 480px) {
          .logo-wrap { width: 72px; height: 72px; }
          h1 { font-size: 1.4rem; }
          p { font-size: 0.85rem; }
          .btn { width: 100%; max-width: 320px; }
        }
      `}</style>

      <div className="logo-wrap">
        <Image
          src="/bplo-logo.png"
          alt="BPLO Logo"
          width={72}
          height={72}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      <div className="office-name">
        Business Permit &amp; Licensing Office
      </div>
      <div className="office-sub">City of San Pablo · Official Portal</div>

      <div className="icon-wrap">
        <svg
          width={24} height={24}
          fill="none" stroke="#16a34a"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <div className="badge">Session Ended</div>

      <h1>Session Expired</h1>
      <p>
        Your session has timed out due to inactivity.
        Please log in again to continue using the
        Business Permit &amp; Licensing System.
      </p>

      <button className="btn" onClick={handleLogin}>
        <svg
          width={16} height={16}
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Back to Login
      </button>

      <div className="footer-note">Access has expired or been revoked.</div>
    </div>
  );
}