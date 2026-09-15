import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const prompt = `
Bạn là chuyên gia OCR tài liệu Toán học. Hãy đọc bức ảnh này và chuyển toàn bộ bài toán thành văn bản và mã LaTeX.
Quy tắc:
1. Mọi ký hiệu, biểu thức toán học phải viết dạng LaTeX ($...$ hoặc $$...$$).
2. Nhận diện các lựa chọn A, B, C, D hoặc a, b, c, d nếu có trong ảnh.
3. Trả về ĐÚNG định dạng JSON:
{
  "title": "Tóm tắt ngắn chủ đề (ví dụ: Đạo hàm hàm số, Tích phân từng phần)",
  "content": "Nội dung câu hỏi đề bài đầy đủ kèm các phương án bằng LaTeX",
  "question_type": "mcq" // điền 'mcq' (trắc nghiệm 4 ý), 'true_false' (đúng sai) hoặc 'short_ans' (trả lời ngắn)
}
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
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
