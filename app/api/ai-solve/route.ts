import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, question_type } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const prompt = `
Bạn là giáo viên chuyên bồi dưỡng Toán 12 THPT. Hãy giải chi tiết bài toán sau đây bằng tiếng Việt.
Định dạng câu hỏi: ${question_type || "Trắc nghiệm"}
Nội dung đề bài:
${content}

Yêu cầu bắt buộc:
1. Sử dụng công thức LaTeX chuẩn: $...$ cho công thức trong dòng và $$...$$ cho công thức khối.
2. Trả về ĐÚNG định dạng JSON với 2 trường:
{
  "correct_answer": "Điền đáp án đúng (ví dụ: A hoặc B hoặc C hoặc D; hoặc a: Đúng | b: Sai...; hoặc số cụ thể)",
  "solution": "Lời giải chi tiết từng bước dễ hiểu bằng LaTeX"
}
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    const data = await res.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(resultText || "{}");

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
