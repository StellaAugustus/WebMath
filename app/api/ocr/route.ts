import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trong biến môi trường." },
        { status: 500 },
      );
    }

    // Đảm bảo lấy đúng chuỗi String base64 thuần túy (loại bỏ hoàn toàn Array)
    let cleanBase64 = "";
    if (Array.isArray(imageBase64)) {
      cleanBase64 = imageBase64 || imageBase64[0] || "";
    } else if (typeof imageBase64 === "string") {
      cleanBase64 = imageBase64.includes(",")
        ? imageBase64.split(",")
        : imageBase64;
    }

    if (!cleanBase64) {
      return NextResponse.json(
        { error: "Dữ liệu ảnh không hợp lệ." },
        { status: 400 },
      );
    }

    const prompt = `
Bạn là chuyên gia OCR tài liệu Toán học. Hãy đọc bức ảnh này và chuyển toàn bộ bài toán thành văn bản và mã LaTeX.
Quy tắc:
1. Mọi ký hiệu, biểu thức toán học phải viết dạng LaTeX ($...$ hoặc $$...$$).
2. Nhận diện các lựa chọn A, B, C, D hoặc a, b, c, d nếu có trong ảnh.
3. Trả về ĐÚNG định dạng JSON:
{
  "title": "Tóm tắt ngắn chủ đề bài toán",
  "content": "Nội dung câu hỏi đề bài đầy đủ kèm các phương án bằng LaTeX",
  "question_type": "mcq"
}
`;

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    };

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
        { error: lastError || "Không thể nhận diện ảnh." },
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
