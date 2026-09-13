"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MathRenderer from "@/components/MathRenderer";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [authChecking, setAuthChecking] = useState(true);

  const [tab, setTab] = useState<"question" | "competition" | "topic">(
    "question",
  );

  // Danh mục
  const [topics, setTopics] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);

  // 1. Quản lý trạng thái Thêm câu hỏi
  const [qType, setQType] = useState<"mcq" | "true_false" | "short_ans">("mcq");
  const [qTitle, setQTitle] = useState("");
  const [qContent, setQContent] = useState("");
  const [qDifficulty, setQDifficulty] = useState("Thông hiểu");
  const [qTopicId, setQTopicId] = useState("");
  const [qCompId, setQCompId] = useState("");
  const [qSolution, setQSolution] = useState("");

  // Các trường cho Trắc nghiệm 4 lựa chọn (MCQ)
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [mcqAnswer, setMcqAnswer] = useState("A");

  // Các trường cho dạng Đúng / Sai
  const [tfItems, setTfItems] = useState([
    { text: "", isTrue: true },
    { text: "", isTrue: false },
    { text: "", isTrue: false },
    { text: "", isTrue: true },
  ]);

  // Trường cho dạng Trả lời ngắn
  const [shortAns, setShortAns] = useState("");

  // Cuộc thi & Chủ đề
  const [cName, setCName] = useState("");
  const [cYear, setCYear] = useState(2025);
  const [cType, setCType] = useState("THPT");
  const [tName, setTName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      setAuthChecking(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }
      setAuthChecking(false);
    }
    checkAuth();
    loadCategories();
  }, []);

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

  // Tổng hợp nội dung đầy đủ để lưu và preview
  const buildFullContent = () => {
    let full = qContent.trim();
    if (qType === "mcq" && (optA || optB || optC || optD)) {
      full += `\n\n**A.** ${optA}\n\n**B.** ${optB}\n\n**C.** ${optC}\n\n**D.** ${optD}`;
    } else if (qType === "true_false") {
      const labels = ["a", "b", "c", "d"];
      full +=
        "\n\n" +
        tfItems
          .map((item, idx) => `**${labels[idx]})** ${item.text || "..."}`)
          .join("\n\n");
    }
    return full;
  };

  const buildCorrectAnswer = () => {
    if (qType === "mcq") return mcqAnswer;
    if (qType === "short_ans") return shortAns.trim();
    if (qType === "true_false") {
      const labels = ["a", "b", "c", "d"];
      return tfItems
        .map((item, idx) => `${labels[idx]}: ${item.isTrue ? "Đúng" : "Sai"}`)
        .join(" | ");
    }
    return "";
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qContent.trim()) return alert("Vui lòng nhập đề bài!");
    setLoading(true);

    const fullContent = buildFullContent();
    const finalAnswer = buildCorrectAnswer();

    const { error } = await supabase.from("questions").insert([
      {
        title: qTitle || null,
        content: fullContent,
        solution: qSolution || null,
        question_type: qType,
        correct_answer: finalAnswer,
        difficulty: qDifficulty,
        topic_id: qTopicId ? Number(qTopicId) : null,
        competition_id: qCompId ? Number(qCompId) : null,
      },
    ]);

    setLoading(false);
    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      alert("Đã thêm bài toán thành công!");
      setQTitle("");
      setQContent("");
      setQSolution("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setShortAns("");
      setTfItems([
        { text: "", isTrue: true },
        { text: "", isTrue: false },
        { text: "", isTrue: false },
        { text: "", isTrue: true },
      ]);
    }
  };

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

  if (authChecking) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Đang xác thực quyền Admin...
      </div>
    );
  }

  if (!currentUser || userRole !== "admin") {
    return (
      <main className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Quyền truy cập bị từ chối
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Trang này chỉ dành cho tài khoản Admin.
        </p>
        <Link
          href="/"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
        >
          Về trang chủ
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản trị & Soạn đề
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Admin: {currentUser.email}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Về trang chủ
        </Link>
      </div>

      {/* Tabs */}
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
          + Thêm Cuộc Thi
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

      {tab === "question" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột Form */}
          <form
            onSubmit={handleAddQuestion}
            className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            {/* Lựa chọn Định dạng câu hỏi */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                Định dạng câu hỏi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setQType("mcq")}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${
                    qType === "mcq"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Trắc nghiệm 4 ý
                </button>
                <button
                  type="button"
                  onClick={() => setQType("true_false")}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${
                    qType === "true_false"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Đúng / Sai
                </button>
                <button
                  type="button"
                  onClick={() => setQType("short_ans")}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${
                    qType === "short_ans"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Trả lời ngắn
                </button>
              </div>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Tiêu đề bài:
                </label>
                <input
                  type="text"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  placeholder="Ví dụ: Cực trị hàm số"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
                />
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
            </div>

            {/* Nội dung đề bài */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                {qType === "true_false"
                  ? "Ngữ cảnh chung / Đề bài:"
                  : "Đề bài (hỗ trợ công thức $...$):"}
              </label>
              <textarea
                rows={4}
                value={qContent}
                onChange={(e) => setQContent(e.target.value)}
                placeholder="Cho hàm số $y = f(x)$..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono outline-blue-600"
                required
              />
            </div>

            {/* 1. Nếu là Trắc nghiệm 4 lựa chọn */}
            {qType === "mcq" && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  4 Phương án & Đáp án đúng:
                </span>
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const val =
                    opt === "A"
                      ? optA
                      : opt === "B"
                        ? optB
                        : opt === "C"
                          ? optC
                          : optD;
                  const setVal =
                    opt === "A"
                      ? setOptA
                      : opt === "B"
                        ? setOptB
                        : opt === "C"
                          ? setOptC
                          : setOptD;
                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mcqAns"
                        checked={mcqAnswer === opt}
                        onChange={() => setMcqAnswer(opt)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-700 w-4">
                        {opt}.
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        placeholder={`Nội dung đáp án ${opt}...`}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Nếu là Đúng / Sai */}
            {qType === "true_false" && (
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  4 Mệnh đề Đúng / Sai:
                </span>
                {["a", "b", "c", "d"].map((label, idx) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-700 pt-2 w-4">
                      {label})
                    </span>
                    <input
                      type="text"
                      value={tfItems[idx].text}
                      onChange={(e) => {
                        const next = [...tfItems];
                        next[idx].text = e.target.value;
                        setTfItems(next);
                      }}
                      placeholder={`Mệnh đề ${label}...`}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                    <select
                      value={tfItems[idx].isTrue ? "true" : "false"}
                      onChange={(e) => {
                        const next = [...tfItems];
                        next[idx].isTrue = e.target.value === "true";
                        setTfItems(next);
                      }}
                      className={`p-2 border rounded-lg text-xs font-semibold ${
                        tfItems[idx].isTrue
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <option value="true">Đúng</option>
                      <option value="false">Sai</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Nếu là Trả lời ngắn */}
            {qType === "short_ans" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Đáp án chính xác (Số hoặc giá trị ngắn):
                </label>
                <input
                  type="text"
                  value={shortAns}
                  onChange={(e) => setShortAns(e.target.value)}
                  placeholder="Ví dụ: 3.5 hoặc -12"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-mono"
                  required
                />
              </div>
            )}

            {/* Lời giải */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Lời giải chi tiết:
              </label>
              <textarea
                rows={4}
                value={qSolution}
                onChange={(e) => setQSolution(e.target.value)}
                placeholder="Lời giải chi tiết (hỗ trợ LaTeX)..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono outline-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition"
            >
              {loading ? "Đang lưu..." : "Lưu bài toán vào ngân hàng"}
            </button>
          </form>

          {/* Cột Xem trước (Preview) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Xem trước trực tiếp:
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  Đề bài hiển thị:
                </div>
                <MathRenderer
                  content={buildFullContent() || "*(Chưa có nội dung)*"}
                />
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-xs font-semibold text-emerald-700 mb-1">
                  Đáp án ghi nhận:
                </div>
                <div className="text-sm font-bold text-emerald-900">
                  {buildCorrectAnswer() || "Chưa thiết lập"}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  Lời giải:
                </div>
                <MathRenderer content={qSolution || "*(Chưa có lời giải)*"} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Cuộc thi */}
      {tab === "competition" && (
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleAddCompetition} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tên cuộc thi:
              </label>
              <input
                type="text"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Ví dụ: Khảo sát Chuyên Khoa Học Tự Nhiên"
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

      {/* Tab Chủ đề */}
      {tab === "topic" && (
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tên chủ đề:
              </label>
              <input
                type="text"
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                placeholder="Ví dụ: Mặt cầu & Khối tròn xoay"
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
