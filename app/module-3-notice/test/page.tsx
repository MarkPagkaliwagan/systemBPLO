"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Notice {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function TestPage() {
  const [data, setData] = useState<Notice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*");

      if (error) {
        setError(error.message);
      } else {
        setData(data || []);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test - Notices</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {data.map((notice) => (
        <div
          key={notice.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <h3>{notice.title}</h3>
          <p>{notice.description}</p>
        </div>
      ))}
    </div>
  );
}