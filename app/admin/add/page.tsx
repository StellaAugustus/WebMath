"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MathRenderer from "@/components/MathRenderer";

export default function AdminPage() {
  const [tab, setTab] = useState<"question" | "competition" | "topic">(
    "question",
  );

  // Dữ liệu danh mục
  const [topics, setTopics] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);

  // State thêm bài toán
  const [qTitle, setQTitle] = useState("");
  const [qContent, setQContent] = useState("");
  const [qSolution, setQSolution] = useState("");
  const [qDifficulty, setQDifficulty] = useState("Thông hiểu");
  const [qTopicId, setQTopicId] = useState("");
  const [qCompId, setQCompId] = useState("");

  // State thêm cuộc thi
  const [cName, setCName] = useState("");
  const [cYear, setCYear] = useState(2025);
  const [cType, setCType] = useState("THPT");

  // State thêm chủ đề
  const [tName, setTName] = useState("");

  const [loading, setLoading] = useState(false);

  // Nạp danh mục
  const loadCategories = async () => {
    const [tRes, cRes] = await Promise.all([
      supabase.from("topics").select("*").order("id"),
      supabase
        .from("competitions")
        .select("*")
        .order("year", { ascending: false }),
    ]);
    if (tRes.data) setTopics(tRes.data);
    if (cRes.data) setCompetitions(cRes.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Xử lý thêm bài toán
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qContent.trim()) return alert("Vui lòng nhập đề bài!");
    setLoading(true);

    const { error } = await supabase.from("questions").insert([
      {
        title: qTitle || null,
        content: qContent,
        solution: qSolution || null,
        difficulty: qDifficulty,
        topic_id: qTopicId ? Number(qTopicId) : null,
        competition_id: qCompId ? Number(qCompId) : null,
      },
    ]);

    setLoading(false);
    if (error) alert("Lỗi: " + error.message);
    else {
      alert("Đã thêm bài toán thành công!");
      setQTitle("");
      setQContent("");
      setQSolution("");
    }
  };

  // Xử lý thêm cuộc thi
  const handleAddCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return alert("Vui lòng nhập tên cuộc thi!");
    setLoading(true);

    const { error } = await supabase.from("competitions").insert([
      {
        name: cName,
        year: Number(cYear),
        exam_type: cType,
      },
    ]);

    setLoading(false);
    if (error) alert("Lỗi: " + error.message);
    else {
      alert("Đã thêm cuộc thi thành công!");
      setCName("");
      loadCategories();
    }
  };

  // Xử lý thêm chủ đề
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return alert("Vui lòng nhập tên chủ đề!");
    setLoading(true);

    const slug = tName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const { error } = await supabase.from("topics").insert([
      {
        name: tName,
        slug: slug || "topic-" + Date.now(),
      },
    ]);

    setLoading(false);
    if (error) alert("Lỗi: " + error.message);
    else {
      alert("Đã thêm chủ đề thành công!");
      setTName("");
      loadCategories();
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Khu vực Quản trị & Nhập liệu
        </h1>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Về trang chủ
        </Link>
      </div>

      {/* Tabs chuyển đổi chức năng */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setTab("question")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            tab === "question"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          + Thêm Bài Toán
        </button>
        <button
          onClick={() => setTab("competition")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            tab === "competition"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          + Thêm Cuộc Thi / Kỳ Thi
        </button>
        <button
          onClick={() => setTab("topic")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
            tab === "topic"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          + Thêm Chủ Đề
        </button>
      </div>

      {/* 1. Form Thêm Bài Toán */}
      {tab === "question" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleAddQuestion}
            className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tiêu đề bài toán (tùy chọn):
              </label>
              <input
                type="text"
                value={qTitle}
                onChange={(e) => setQTitle(e.target.value)}
                placeholder="Ví dụ: Tính tích phân hàm phân thức"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Kỳ thi:
                </label>
                <select
                  value={qCompId}
                  onChange={(e) => setQCompId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-blue-600"
                >
                  <option value="">-- Chọn kỳ thi --</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Chủ đề:
                </label>
                <select
                  value={qTopicId}
                  onChange={(e) => setQTopicId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-blue-600"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Mức độ:
              </label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-blue-600"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Đề bài (hỗ trợ $...$):
              </label>
              <textarea
                rows={5}
                value={qContent}
                onChange={(e) => setQContent(e.target.value)}
                placeholder="Cho hàm số $y = f(x)$..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono outline-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Lời giải chi tiết:
              </label>
              <textarea
                rows={5}
                value={qSolution}
                onChange={(e) => setQSolution(e.target.value)}
                placeholder="Lời giải chi tiết..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono outline-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition"
            >
              {loading ? "Đang lưu..." : "Lưu bài toán"}
            </button>
          </form>

          {/* Live Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Xem trước trực tiếp:
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  Đề bài
                </div>
                <MathRenderer
                  content={
                    qContent || "*(Nội dung đề bài sẽ hiển thị tại đây)*"
                  }
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  Lời giải
                </div>
                <MathRenderer
                  content={
                    qSolution || "*(Nội dung lời giải sẽ hiển thị tại đây)*"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Form Thêm Cuộc Thi */}
      {tab === "competition" && (
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleAddCompetition} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tên kỳ thi / Cuộc thi:
              </label>
              <input
                type="text"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Ví dụ: Thi thử Chuyên Sư Phạm Lần 1"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Năm thi:
                </label>
                <input
                  type="number"
                  value={cYear}
                  onChange={(e) => setCYear(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Loại kỳ thi:
                </label>
                <select
                  value={cType}
                  onChange={(e) => setCType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-blue-600"
                >
                  <option value="THPT">Tốt nghiệp THPT</option>
                  <option value="ĐGTD">Đánh giá tư duy</option>
                  <option value="ĐGNL">Đánh giá năng lực</option>
                  <option value="HSG">Học sinh giỏi</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition"
            >
              {loading ? "Đang lưu..." : "+ Tạo cuộc thi mới"}
            </button>
          </form>
        </div>
      )}

      {/* 3. Form Thêm Chủ Đề */}
      {tab === "topic" && (
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tên chủ đề mới:
              </label>
              <input
                type="text"
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                placeholder="Ví dụ: Phương trình mũ & logarit"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition"
            >
              {loading ? "Đang lưu..." : "+ Tạo chủ đề mới"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
