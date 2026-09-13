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

  const [isAdmin, setIsAdmin] = useState(false);
  const [competition, setCompetition] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState<{ [key: number]: boolean }>(
    {},
  );

  // State dành cho Modal Chỉnh sửa
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSolution, setEditSolution] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra vai trò Admin
    async function checkRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role === "admin") setIsAdmin(true);
      }
    }
    checkRole();
    loadData();
  }, [compId]);

  const loadData = async () => {
    setLoading(true);
    const compRes = await supabase
      .from("competitions")
      .select("*")
      .eq("id", compId)
      .single();
    if (compRes.data) setCompetition(compRes.data);

    const qRes = await supabase
      .from("questions")
      .select("*, topics(id, name)")
      .eq("competition_id", compId)
      .order("id", { ascending: true });

    if (qRes.data) {
      setQuestions(qRes.data);
      const uniqueTopicsMap = new Map();
      qRes.data.forEach((q) => {
        if (q.topics) uniqueTopicsMap.set(q.topics.id, q.topics);
      });
      setTopics(Array.from(uniqueTopicsMap.values()));
    }
    setLoading(false);
  };

  // Hàm Xóa câu hỏi
  const handleDeleteQuestion = async (qId: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa bài toán này không? Thao tác này không thể hoàn tác.",
      )
    )
      return;

    const { error } = await supabase.from("questions").delete().eq("id", qId);
    if (error) {
      alert("Lỗi xóa bài: " + error.message);
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
      alert("Đã xóa câu hỏi thành công!");
    }
  };

  // Mở modal Sửa câu hỏi
  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setEditContent(q.content);
    setEditSolution(q.solution || "");
    setEditAnswer(q.correct_answer || "");
    setEditDifficulty(q.difficulty || "Thông hiểu");
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from("questions")
      .update({
        content: editContent,
        solution: editSolution,
        correct_answer: editAnswer,
        difficulty: editDifficulty,
      })
      .eq("id", editingQuestion.id);

    setIsUpdating(false);
    if (error) {
      alert("Lỗi cập nhật: " + error.message);
    } else {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                content: editContent,
                solution: editSolution,
                correct_answer: editAnswer,
                difficulty: editDifficulty,
              }
            : q,
        ),
      );
      setEditingQuestion(null);
      alert("Cập nhật thành công!");
    }
  };

  const toggleSolution = (id: number) => {
    setShowSolution((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredQuestions =
    activeTopicId === "all"
      ? questions
      : questions.filter((q) => q.topic_id === activeTopicId);

  const getFormatBadge = (type: string) => {
    if (type === "true_false")
      return (
        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
          Đúng / Sai
        </span>
      );
    if (type === "short_ans")
      return (
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
          Trả lời ngắn
        </span>
      );
    return (
      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
        Trắc nghiệm
      </span>
    );
  };

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

      {/* Tabs Chủ đề */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
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
            Tất cả ({questions.length})
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
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
            Chưa có bài toán nào thuộc chủ đề này trong kỳ thi.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative"
            >
              {/* Header câu hỏi + Nút Sửa/Xóa của Admin */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Câu {idx + 1}
                  </span>
                  {getFormatBadge(q.question_type)}
                  {q.difficulty && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {q.difficulty}
                    </span>
                  )}
                </div>

                {/* Nút thao tác Admin */}
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(q)}
                      className="text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                )}
              </div>

              {/* Đề bài */}
              <div className="text-slate-800 text-base leading-relaxed mb-4">
                <MathRenderer content={q.content} />
              </div>

              {/* Lời giải & Đáp án */}
              {(q.solution || q.correct_answer) && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    {showSolution[q.id]
                      ? "▲ Ẩn đáp án & lời giải"
                      : "▼ Xem đáp án & lời giải chi tiết"}
                  </button>

                  {showSolution[q.id] && (
                    <div className="mt-3 space-y-3">
                      {q.correct_answer && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                          <span className="font-bold">Đáp án đúng:</span>
                          <span className="font-mono text-sm font-semibold">
                            {q.correct_answer}
                          </span>
                        </div>
                      )}
                      {q.solution && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                          <MathRenderer content={q.solution} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* POPUP MODAL CHỈNH SỬA CÂU HỎI */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Chỉnh sửa bài toán #{editingQuestion.id}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Mức độ:
                </label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Đề bài:
                </label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Đáp án đúng:
                </label>
                <input
                  type="text"
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  placeholder="Ví dụ: A hoặc a: Đúng | b: Sai... hoặc 12"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Lời giải chi tiết:
                </label>
                <textarea
                  rows={5}
                  value={editSolution}
                  onChange={(e) => setEditSolution(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
