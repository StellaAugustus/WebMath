"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MathRenderer from "@/components/MathRenderer";

export default function HomePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState<{ [key: number]: boolean }>(
    {},
  );

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("questions")
        .select(
          `
          *,
          topics(name),
          competitions(name, year)
        `,
        )
        .order("id", { ascending: false });

      if (!error && data) {
        setQuestions(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleSolution = (id: number) => {
    setShowSolution((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải câu hỏi...</div>
    );

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        Ngân Hàng Bài Toán Lớp 12
      </h1>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">
                Câu {index + 1}:
              </span>
              <div className="space-x-2 text-xs">
                {q.topics?.name && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {q.topics.name}
                  </span>
                )}
                {q.competitions?.name && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {q.competitions.name} ({q.competitions.year})
                  </span>
                )}
              </div>
            </div>

            {/* Nội dung đề bài */}
            <MathRenderer content={q.content} />

            {/* Hình ảnh nếu có */}
            {q.image_url && (
              <img
                src={q.image_url}
                alt="Đồ thị/Hình vẽ"
                className="my-4 max-h-64 object-contain rounded"
              />
            )}

            {/* Nút xem lời giải */}
            {q.solution && (
              <div className="mt-4 pt-3 border-t">
                <button
                  onClick={() => toggleSolution(q.id)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {showSolution[q.id]
                    ? "▲ Ẩn lời giải"
                    : "▼ Xem lời giải chi tiết"}
                </button>

                {showSolution[q.id] && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-md border text-sm">
                    <MathRenderer content={q.solution} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
