"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="text-xs text-gray-500 hover:text-red-600 transition px-3 py-1 rounded border border-gray-200 hover:border-red-200"
    >
      {loading ? "登出中…" : "登出"}
    </button>
  );
}
