import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, question_type } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trong biến môi trường." },
        { status: 500 },
      );
    }

    const prompt = `
Bạn là giáo viên chuyên dạy Toán 12 THPT. Hãy giải chi tiết bài toán sau đây bằng tiếng Việt.
Định dạng câu hỏi: ${question_type || "Trắc nghiệm"}
Nội dung đề bài:
${content}

Yêu cầu bắt buộc:
1. Sử dụng công thức LaTeX chuẩn: $...$ cho công thức trong dòng và $$...$$ cho công thức khối.
2. Trả về ĐÚNG định dạng JSON với 2 trường (không thêm markdown ngoài JSON):
{
  "correct_answer": "Điền đáp án đúng (ví dụ: A hoặc B hoặc C hoặc D; hoặc a: Đúng | b: Sai...; hoặc số cụ thể)",
  "solution": "Lời giải chi tiết từng bước dễ hiểu bằng LaTeX"
}
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    // Tự động thử model 2.5-flash và flash-latest
    const models = ["gemini-2.5-flash", "gemini-flash-latest"];
    let lastError = "";
    let resultData = null;

    for (const model of models) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (res.ok) {
        resultData = data;
        break;
      }
      lastError = data.error?.message || `Lỗi từ model ${model}`;
    }

    if (!resultData) {
      return NextResponse.json(
        { error: lastError || "Không tìm thấy model AI khả dụng." },
        { status: 500 },
      );
    }

    const resultText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(resultText || "{}");

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
