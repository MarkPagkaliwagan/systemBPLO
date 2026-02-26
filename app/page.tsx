"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Student {
  id: number;
  name: string;
  age: number;
  created_at: string;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*");

      if (error) {
        console.log(error.message);
      } else {
        setStudents(data as Student[]); // 👈 cast na lang
      }
    };

    fetchStudents();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Students</h1>

      {students.map((student) => (
        <div key={student.id}>
          <p>{student.name}</p>
          <p>{student.age}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}