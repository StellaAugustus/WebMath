import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-80 transition"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
            12
          </span>
          <span>Toán THPT</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            Trang chủ
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium bg-slate-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition shadow-sm"
          >
            + Quản lý & Thêm mới
          </Link>
        </nav>
      </div>
    </header>
  );
}
