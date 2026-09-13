"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    // 1. Kiểm tra session hiện tại
    async function getUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile) setRole(profile.role);
      }
    }
    getUserData();

    // 2. Lắng nghe sự kiện đăng nhập / đăng xuất tức thì
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile) setRole(profile?.role || "user");
      } else {
        setUser(null);
        setRole("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

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

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Trang chủ
          </Link>

          {/* Chỉ Admin mới thấy nút này */}
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-medium bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              + Quản lý & Thêm mới
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                {role === "admin" ? "⭐ Admin" : "Học sinh"}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:underline px-2 py-1"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
