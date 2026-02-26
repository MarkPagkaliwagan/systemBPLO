"use client";

import React, { useState, useEffect } from "react";

interface NoticeDetails {
  businessId: string;
  businessName: string;
  violationType: string;
  violationDate: string;
  deadline: string;
  status: string;
  daysRemaining: number;
  notices: { id: number; sentDate: string }[];
}

// Dummy placeholder data
const dummyData: NoticeDetails = {
  businessId: "73-4422523",
  businessName: "Donato's Store",
  violationType: "Fire Safety",
  violationDate: "February 25, 2026",
  deadline: "February 28, 2026",
  status: "Pending / Needs C&D Review",
  daysRemaining: 3,
  notices: [
    { id: 1, sentDate: "February 25, 2026" },
    { id: 2, sentDate: "March 02, 2026" },
    { id: 3, sentDate: "March 07, 2026" },
  ],
};

const BusinessNoticeDetails = () => {
  const [details, setDetails] = useState<NoticeDetails | null>(null);

  useEffect(() => {
    // Simulate async fetch with placeholder
    const timer = setTimeout(() => {
      setDetails(dummyData);
    }, 500); // show "Loading..." for 0.5s
    return () => clearTimeout(timer);
  }, []);

  if (!details) {
    return (
      <p className="p-8 text-center text-gray-400 italic animate-pulse">
        Loading placeholder data...
      </p>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold bg-green-800 text-white p-4 rounded">
        {details.businessId} - BUSINESS COMPLIANCE NOTICE DETAILS
      </h1>

      {/* Business Info */}
      <div className="p-4 border rounded shadow space-y-2">
        <h2 className="bg-green-800 text-white py-2 px-3 rounded mb-2">
          Business Information
        </h2>
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Business ID</strong>: {details.businessId}</p>
          <p><strong>Business Name</strong>: {details.businessName}</p>
          <p><strong>Violation Type</strong>: {details.violationType}</p>
          <p><strong>Violation Date</strong>: {details.violationDate}</p>
          <p><strong>Deadline</strong>: {details.deadline}</p>
          <p><strong>Status</strong>: {details.status}</p>
          <p><strong>Days Remaining</strong>: {details.daysRemaining}</p>
        </div>
      </div>

      {/* Notice Timeline */}
      <div className="p-4 border rounded shadow space-y-2">
        <h2 className="bg-green-800 text-white py-2 px-3 rounded mb-2">
          Notice Timeline
        </h2>
        <ul className="text-sm space-y-1 text-gray-700">
          {details.notices.map((notice) => (
            <li key={notice.id}>
              Notice {notice.id} : Sent {notice.sentDate}
            </li>
          ))}
        </ul>
      </div>

      {/* Countdown Timer */}
      <div className="p-4 border rounded shadow space-y-1">
        <h2 className="bg-green-800 text-white py-2 px-3 rounded mb-2">
          Countdown Timer
        </h2>
        <p><strong>Overall Deadline</strong>: {details.deadline}</p>
        <p><strong>Days Remaining</strong>: {details.daysRemaining}</p>
      </div>
    </div>
  );
};

export default BusinessNoticeDetails;