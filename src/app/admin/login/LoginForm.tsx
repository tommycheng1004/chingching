"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ next, error: initError }: { next?: string; error?: string }) {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initError || "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user.trim() || !pass.trim()) {
      setError("請填寫帳號與密碼");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "登入失敗");
      }
      // 跳轉到原本要去的頁面或 /admin
      window.location.href = next || "/admin";
    } catch (err: any) {
      setError(err.message || "登入失敗");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-brand p-6 sm:p-8 space-y-4">
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">帳號</label>
        <input
          type="text"
          autoComplete="username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-brand"
          placeholder="admin"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">密碼</label>
        <input
          type="password"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-brand"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-step-grad text-white font-semibold py-2.5 hover:opacity-90 transition disabled:opacity-60 shadow-brand"
      >
        {submitting ? "登入中…" : "登入"}
      </button>

      <p className="text-center text-xs text-ink-muted pt-2">
        此區域僅供顧問使用
      </p>
    </form>
  );
}
