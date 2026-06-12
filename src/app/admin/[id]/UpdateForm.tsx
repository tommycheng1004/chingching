"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@/types";

export default function UpdateForm({
  id,
  status: initStatus,
  notes: initNotes,
}: {
  id: string;
  status: LeadStatus;
  notes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(initStatus);
  const [notes, setNotes] = useState(initNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function remove() {
    if (!confirm("確定要刪除這筆名單嗎？\n會同時刪除 Supabase 中的資料與 PDF 報告，無法復原。")) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/admin/${id}`, { method: "DELETE" });
    if (res.ok) {
      // 強制整頁重新載入，繞過 Next.js 客戶端快取
      window.location.href = "/admin";
    } else {
      const text = await res.text().catch(() => "");
      alert(`刪除失敗：${res.status} ${text}`);
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4 h-fit sticky top-6">
      <h2 className="font-bold">顧問操作</h2>

      <div>
        <label className="text-xs text-gray-500 block mb-1">狀態</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="new">🆕 新名單</option>
          <option value="contacted">📞 已聯絡</option>
          <option value="closed">✅ 已成交</option>
          <option value="lost">❌ 已流失</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">備註</label>
        <textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="這個客戶的後續記錄…"
          className="w-full rounded border border-gray-200 p-3 text-sm"
        />
      </div>

      <button
        onClick={save}
        disabled={saving || deleting}
        className="w-full rounded bg-brand text-white py-2 text-sm font-medium disabled:opacity-60"
      >
        {saving ? "儲存中…" : saved ? "✓ 已儲存" : "儲存變更"}
      </button>

      <div className="pt-3 mt-2 border-t border-gray-100">
        <button
          onClick={remove}
          disabled={saving || deleting}
          className="w-full rounded border border-red-200 text-red-600 hover:bg-red-50 py-2 text-sm font-medium disabled:opacity-60 transition"
        >
          {deleting ? "刪除中…" : "🗑 刪除這筆名單"}
        </button>
      </div>
    </div>
  );
}
