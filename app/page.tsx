"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MathRenderer from "@/components/MathRenderer";

export default function HomePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedComp, setSelectedComp] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSolution, setShowSolution] = useState<{ [key: number]: boolean }>(
    {},
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Lấy danh mục topics và competitions
      const [topRes, compRes, qRes] = await Promise.all([
        supabase.from("topics").select("*"),
        supabase.from("competitions").select("*"),
        supabase
          .from("questions")
          .select("*, topics(name), competitions(name, year)")
          .order("id", { ascending: false }),
      ]);

      if (topRes.data) setTopics(topRes.data);
      if (compRes.data) setCompetitions(compRes.data);
      if (qRes.data) setQuestions(qRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Lọc câu hỏi theo điều kiện
  const filteredQuestions = questions.filter((q) => {
    const matchTopic = selectedTopic
      ? q.topic_id === Number(selectedTopic)
      : true;
    const matchComp = selectedComp
      ? q.competition_id === Number(selectedComp)
      : true;
    const matchKeyword = searchKeyword
      ? (q.content + (q.title || ""))
          .toLowerCase()
          .includes(searchKeyword.toLowerCase())
      : true;
    return matchTopic && matchComp && matchKeyword;
  });

  const toggleSolution = (id: number) => {
    setShowSolution((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Tiêu đề & Bộ lọc */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Kho Bài Toán Ôn Thi Lớp 12
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Tìm theo từ khóa đề bài..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm outline-blue-500"
          />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm outline-blue-500 bg-white"
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm outline-blue-500 bg-white"
          >
            <option value="">Tất cả kỳ thi</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Đang tải câu hỏi...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          Chưa có câu hỏi nào khớp với bộ lọc.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="font-bold text-blue-700">
                  Câu {idx + 1} {q.title ? `— ${q.title}` : ""}
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {q.topics?.name && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                      {q.topics.name}
                    </span>
                  )}
                  {q.competitions?.name && (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                      {q.competitions.name} ({q.competitions.year})
                    </span>
                  )}
                  {q.difficulty && (
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                      {q.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Đề bài */}
              <div className="text-gray-900">
                <MathRenderer content={q.content} />
              </div>

              {/* Hình vẽ nếu có */}
              {q.image_url && (
                <img
                  src={q.image_url}
                  alt="Hình vẽ"
                  className="my-3 max-h-64 object-contain rounded border"
                />
              )}

              {/* Nút xem lời giải */}
              {q.solution && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {showSolution[q.id]
                      ? "▲ Ẩn lời giải"
                      : "▼ Xem lời giải chi tiết"}
                  </button>
                  {showSolution[q.id] && (
                    <div className="mt-2.5 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                      <MathRenderer content={q.solution} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
