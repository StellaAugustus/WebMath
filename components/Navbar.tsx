import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-xl text-blue-600 flex items-center gap-2"
        >
          <span>📐</span> Ngân Hàng Toán 12
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Danh sách câu hỏi
          </Link>
          <Link
            href="/admin/add"
            className="text-sm font-medium bg-blue-600 text-white px-3.5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Thêm bài toán
          </Link>
        </div>
      </div>
    </header>
  );
}
