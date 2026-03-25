"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SessionExpiredPage() {
  const router = useRouter();
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 5 + 2;
      const color = Math.random() > 0.5 ? "#2d7a50" : "#c9a84c";
      p.style.cssText = `
        position: absolute;
        border-radius: 50%;
        opacity: 0;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${Math.random() * 100}%;
        bottom: -10px;
        animation: floatUp ${Math.random() * 12 + 8}s ${Math.random() * 10}s linear infinite;
      `;
      container.appendChild(p);
    }
  }, []);

  function handleLogin() {
    // Wipe ALL stale auth data — this is what breaks the reload loop
    sessionStorage.clear();
    const authKeys = [
      "token", "authToken", "accessToken", "refreshToken",
      "sessionId", "user", "userData", "isLoggedIn", "sessionExpiry",
    ];
    authKeys.forEach((k) => localStorage.removeItem(k));

    // replace() removes /session-expired from history so Back won't loop
    router.replace("/");
  }

  return (
    <>
      <style>{`
        :root {
          --green-dark:  #1a4731;
          --green-mid:   #256044;
          --green-light: #3a8c62;
          --green-pale:  #e8f4ee;
          --gold:        #c9a84c;
          --ink:         #1c2b22;
          --mist:        #f5f9f6;
        }

        .bplo-wrap {
          font-family: Arial, sans-serif;
          background: var(--mist);
          color: var(--ink);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .bplo-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,96,68,.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 100% 100%, rgba(201,168,76,.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(37,96,68,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,96,68,.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) scale(1); }
          10%  { opacity: .6; }
          90%  { opacity: .15; }
          100% { opacity: 0; transform: translateY(-100vh) scale(.4); }
        }

        .card {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(37,96,68,.15);
          border-radius: 20px;
          padding: 56px 48px 48px;
          width: min(480px, 92vw);
          text-align: center;
          box-shadow:
            0 2px 4px rgba(26,71,49,.04),
            0 8px 24px rgba(26,71,49,.08),
            0 32px 64px rgba(26,71,49,.10);
          animation: rise .65s cubic-bezier(.22,1,.36,1) both;
          z-index: 1;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          border-radius: 0 0 4px 4px;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(28px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .seal-wrap {
          width: 88px; height: 88px;
          margin: 0 auto 20px;
          position: relative;
          animation: pop .5s .2s cubic-bezier(.34,1.56,.64,1) both;
        }

        @keyframes pop {
          from { opacity: 0; transform: scale(.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        .office-name {
          font-family: Arial, sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--green-mid);
          letter-spacing: .06em;
          text-transform: uppercase;
          line-height: 1.35;
          margin-bottom: 6px;
          animation: fadein .5s .35s both;
        }

        .office-sub {
          font-size: .78rem;
          color: #6b8a74;
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: fadein .5s .4s both;
        }

        @keyframes fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .divider {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, var(--green-light), var(--gold));
          border-radius: 2px;
          margin: 0 auto 28px;
          animation: fadein .5s .42s both;
        }

        .code-404 {
          font-family: Arial, sans-serif;
          font-size: 5.5rem;
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg, var(--green-dark) 0%, var(--green-light) 60%, var(--gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          animation: fadein .5s .45s both;
        }

        .session-icon {
          width: 48px; height: 48px;
          background: var(--green-pale);
          border: 1.5px solid rgba(37,96,68,.2);
          border-radius: 50%;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadein .5s .5s both;
        }

        .card h1 {
          font-family: Arial, sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--green-dark);
          margin-bottom: 10px;
          animation: fadein .5s .52s both;
        }

        .card p {
          font-size: .875rem;
          color: #5a7a66;
          line-height: 1.65;
          margin-bottom: 32px;
          animation: fadein .5s .55s both;
        }

        .btn-login {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--green-dark);
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: .9rem;
          font-weight: 600;
          letter-spacing: .02em;
          padding: 13px 36px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 16px rgba(26,71,49,.25);
          animation: fadein .5s .6s both;
        }

        .btn-login::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .btn-login:hover {
          background: var(--green-mid);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,71,49,.3);
        }

        .btn-login:active { transform: translateY(0); }

        .footer-note {
          margin-top: 28px;
          font-size: .73rem;
          color: #9ab8a4;
          letter-spacing: .03em;
          animation: fadein .5s .65s both;
        }
      `}</style>

      <div className="bplo-wrap">
        <div className="grid-bg" />
        <div className="particles" ref={particlesRef} />

        <div className="card">
          <div className="seal-wrap">
            <Image
              src="/bplo-logo.png"
              alt="Business Permit and Licensing Office Logo"
              width={88}
              height={88}
              style={{ objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(26,71,49,.2))" }}
              priority
            />
          </div>

          <div className="office-name">
            Business Permit &amp;<br />Licensing Office
          </div>
          <div className="office-sub">City of San Pablo · Official Portal</div>

          <div className="divider" />

          <div className="code-404">404</div>

          <div className="session-icon">
            <svg
              width={22} height={22}
              fill="none" stroke="#256044"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h1>Session Expired</h1>
          <p>
            Your session has timed out due to inactivity.<br />
            Please log in again to continue using the<br />
            Business Permit &amp; Licensing System.
          </p>

          <button className="btn-login" onClick={handleLogin}>
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
            Login
          </button>

          <div className="footer-note">Page not found or access has been revoked.</div>
        </div>
      </div>
    </>
  );
}