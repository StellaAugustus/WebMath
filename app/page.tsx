"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompetitions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("year", { ascending: false });

      if (!error && data) {
        setCompetitions(data);
      }
      setLoading(false);
    }
    loadCompetitions();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Tiêu đề tối giản */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Kỳ thi & Cuộc thi Toán 12
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Chọn một kỳ thi để xem danh sách câu hỏi phân loại theo từng chủ đề.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Đang tải danh sách kỳ thi...
        </div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <p className="text-slate-500 mb-4">Chưa có cuộc thi nào được tạo.</p>
          <Link
            href="/admin"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Thêm cuộc thi đầu tiên tại đây
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {competitions.map((c) => (
            <Link
              key={c.id}
              href={`/competitions/${c.id}`}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {c.exam_type || "Kỳ thi"}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Năm {c.year}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
                  {c.name}
                </h2>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600">
                <span>Xem các chủ đề</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
