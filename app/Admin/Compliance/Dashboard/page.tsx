"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Violation {
  id: number;
  business_id: number | null;
  notice_level: number;
  status: string;
  penalty_amount: number;
  buses: {
    business_name: string;
  } | null;
}

export default function TablePage() {
  const [violations, setViolations] = useState<Violation[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase.from("violations").select(`
      id,
      business_id,
      notice_level,
      status,
      penalty_amount,
      buses (
        business_name
      )
    `);

    if (error) {
      console.error("Error fetching violations:", error);
      return;
    }

    if (!data) return;

    const typedData = data as unknown as Violation[];
    setViolations(typedData);
  };

  const getStatusBadge = (status: string) => {
    if (status === "open") return "bg-green-100 text-green-700";
    if (status === "cease_desist") return "bg-red-100 text-red-600";
    if (status === "resolved") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  const getNoticeBadge = (
    requiredLevel: number,
    currentLevel: number,
    status: string
  ) => {
    if (status === "resolved")
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          -
        </span>
      );

    if (currentLevel >= requiredLevel)
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          Sent
        </span>
      );

    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-green-800 text-white uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Business ID</th>
              <th className="px-6 py-4">Business Name</th>
              <th className="px-6 py-4">Notice 1</th>
              <th className="px-6 py-4">Notice 2</th>
              <th className="px-6 py-4">Notice 3</th>
              <th className="px-6 py-4">Penalty</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {violations.map((v) => (
              <tr key={v.id} className="hover:bg-green-50 transition">
                <td className="px-6 py-4 font-medium">{v.business_id}</td>

                <td className="px-6 py-4 font-semibold text-green-800">
                  {v.buses?.business_name ?? "No Business"}
                </td>

                <td className="px-6 py-4">
                  {getNoticeBadge(1, v.notice_level, v.status)}
                </td>

                <td className="px-6 py-4">
                  {getNoticeBadge(2, v.notice_level, v.status)}
                </td>

                <td className="px-6 py-4">
                  {getNoticeBadge(3, v.notice_level, v.status)}
                </td>

                <td className="px-6 py-4 font-semibold text-red-600">
                  ₱ {v.penalty_amount?.toLocaleString() ?? "0"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(
                      v.status
                    )}`}
                  >
                    {v.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}