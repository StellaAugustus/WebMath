"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegister) {
      // Đăng ký tài khoản
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        alert("Đăng ký thành công! Đang chuyển hướng...");
        router.push("/");
        router.refresh();
      }
    } else {
      // Đăng nhập
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
          {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </h1>
        <p className="text-xs text-center text-slate-500 mb-6">
          {isRegister
            ? "Tạo tài khoản học sinh để theo dõi bài học"
            : "Đăng nhập vào hệ thống Toán 12"}
        </p>

        {message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition"
          >
            {loading
              ? "Đang xử lý..."
              : isRegister
                ? "Đăng ký tài khoản"
                : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegister ? "Đăng nhập ngay" : "Đăng ký tại đây"}
          </button>
        </div>
      </div>
    </main>
  );
}
