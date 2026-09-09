"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import MathRenderer from "@/components/MathRenderer";

export default function AddQuestionPage() {
  const [content, setContent] = useState("");
  const [solution, setSolution] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return alert("Vui lòng nhập đề bài");
    setSaving(true);

    const { error } = await supabase
      .from("questions")
      .insert([{ content, solution }]);

    setSaving(false);
    if (error) {
      alert("Lỗi lưu bài: " + error.message);
    } else {
      alert("Đã lưu bài toán thành công!");
      setContent("");
      setSolution("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Thêm Bài Toán Mới</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột nhập liệu */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Đề bài (hỗ trợ LaTeX $...$):
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded font-mono text-sm"
              placeholder="Cho hàm số $y = x^3 - 3x^2 + 2$. Tìm..."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Lời giải chi tiết:</label>
            <textarea
              rows={6}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="w-full p-2 border rounded font-mono text-sm"
              placeholder="Ta có đạo hàm $y' = 3x^2 - 6x = 0 \Leftrightarrow \dots$"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Đang lưu..." : "Lưu vào ngân hàng đề"}
          </button>
        </div>

        {/* Cột Xem trước trực tiếp */}
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-semibold text-gray-600 mb-2">
            Xem trước (Live Preview):
          </h3>
          <div className="border-b pb-4 mb-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              Đề bài
            </h4>
            <MathRenderer content={content || "*(Chưa có nội dung đề bài)*"} />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              Lời giải
            </h4>
            <MathRenderer content={solution || "*(Chưa có lời giải)*"} />
          </div>
        </div>
      </div>
    </div>
  );
}
