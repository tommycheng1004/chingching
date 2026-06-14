"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ bookingUrl: initUrl }: { bookingUrl: string }) {
  const router = useRouter();
  const [bookingUrl, setBookingUrl] = useState(initUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_url: bookingUrl.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        const t = await res.text().catch(() => "");
        setError(`儲存失敗：${res.status} ${t}`);
      }
    } catch (e: any) {
      setError(`儲存失敗：${e.message}`);
    }
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Google 日曆預約連結</label>
        <p className="text-xs text-gray-500 mb-2">
          客戶在表單最後一步會點這個連結到你的 Google 日曆挑時段。換預約連結時改這裡就好。
        </p>
        <input
          type="url"
          value={bookingUrl}
          onChange={(e) => setBookingUrl(e.target.value)}
          placeholder="https://calendar.app.google/xxxxxx"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
        />
        {bookingUrl.trim() && (
          <a
            href={bookingUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs text-brand-dark underline"
          >
            ↗ 開新分頁測試這個連結
          </a>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="rounded bg-brand text-white px-5 py-2 text-sm font-medium disabled:opacity-60"
      >
        {saving ? "儲存中…" : saved ? "✓ 已儲存" : "儲存"}
      </button>
    </div>
  );
}
