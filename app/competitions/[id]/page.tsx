"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MathRenderer from "@/components/MathRenderer";

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const compId = Number(resolvedParams.id);

  const [competition, setCompetition] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState<{ [key: number]: boolean }>(
    {},
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Lấy thông tin kỳ thi
      const compRes = await supabase
        .from("competitions")
        .select("*")
        .eq("id", compId)
        .single();
      if (compRes.data) setCompetition(compRes.data);

      // Lấy các câu hỏi thuộc kỳ thi này
      const qRes = await supabase
        .from("questions")
        .select("*, topics(id, name)")
        .eq("competition_id", compId)
        .order("id", { ascending: true });

      if (qRes.data) {
        setQuestions(qRes.data);
        // Trích xuất danh sách các chủ đề duy nhất có trong kỳ thi này
        const uniqueTopicsMap = new Map();
        qRes.data.forEach((q) => {
          if (q.topics) {
            uniqueTopicsMap.set(q.topics.id, q.topics);
          }
        });
        setTopics(Array.from(uniqueTopicsMap.values()));
      }
      setLoading(false);
    }
    loadData();
  }, [compId]);

  const toggleSolution = (id: number) => {
    setShowSolution((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredQuestions =
    activeTopicId === "all"
      ? questions
      : questions.filter((q) => q.topic_id === activeTopicId);

  if (loading)
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Đang tải dữ liệu...
      </div>
    );
  if (!competition)
    return (
      <div className="py-20 text-center text-slate-500">
        Không tìm thấy kỳ thi này.
      </div>
    );

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb quay về trang chủ */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-4 transition"
      >
        ← Quay lại danh sách kỳ thi
      </Link>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          Năm {competition.year}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
          {competition.name}
        </h1>
      </div>

      {/* Danh sách các chủ đề có trong cuộc thi */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Chọn chủ đề câu hỏi:
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTopicId("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              activeTopicId === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Tất cả chủ đề ({questions.length})
          </button>
          {topics.map((t) => {
            const count = questions.filter((q) => q.topic_id === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTopicId(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  activeTopicId === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
            Chưa có bài toán nào thuộc chủ đề này trong kỳ thi.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-900">
                  Câu {idx + 1} {q.title ? `— ${q.title}` : ""}
                </span>
                <div className="flex items-center gap-2">
                  {q.topics?.name && (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {q.topics.name}
                    </span>
                  )}
                  {q.difficulty && (
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                      {q.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Đề bài */}
              <div className="text-slate-800 text-base leading-relaxed">
                <MathRenderer content={q.content} />
              </div>

              {/* Lời giải */}
              {q.solution && (
                <div className="mt-5 pt-3">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    {showSolution[q.id]
                      ? "▲ Ẩn lời giải"
                      : "▼ Xem lời giải chi tiết"}
                  </button>

                  {showSolution[q.id] && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                      <MathRenderer content={q.solution} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
