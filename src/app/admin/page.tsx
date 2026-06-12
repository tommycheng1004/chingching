import { firestore, LEADS, tsToIso } from "@/lib/firebase";
import Link from "next/link";
import { Lead, LeadStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "🆕 新名單",
  contacted: "📞 已聯絡",
  closed: "✅ 已成交",
  lost: "❌ 已流失",
};
const STATUS_COLOR: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  closed: "bg-emerald-50 text-emerald-700",
  lost: "bg-gray-100 text-gray-500",
};

export default async function AdminList({
  searchParams,
}: {
  searchParams: { status?: LeadStatus; q?: string };
}) {
  let q = firestore().collection(LEADS).orderBy("created_at", "desc") as FirebaseFirestore.Query;
  if (searchParams.status) q = q.where("status", "==", searchParams.status);
  const snap = await q.get();
  let leads = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
    created_at: tsToIso(d.data().created_at),
  })) as Lead[];
  // email 搜尋：Firestore 不支援 contains，改在客戶端 filter
  if (searchParams.q) {
    const kw = searchParams.q.toLowerCase();
    leads = leads.filter((l) => l.email.toLowerCase().includes(kw));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">名單列表（{leads.length}）</h1>
        <form className="flex gap-2">
          <input
            name="q"
            placeholder="搜尋 email…"
            defaultValue={searchParams.q || ""}
            className="rounded border border-gray-200 px-3 py-1.5 text-sm"
          />
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="rounded border border-gray-200 px-3 py-1.5 text-sm"
          >
            <option value="">全部狀態</option>
            <option value="new">新名單</option>
            <option value="contacted">已聯絡</option>
            <option value="closed">已成交</option>
            <option value="lost">已流失</option>
          </select>
          <button className="rounded bg-brand text-white px-3 py-1.5 text-sm">篩選</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">時間</th>
              <th className="px-4 py-3">姓名</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">方案</th>
              <th className="px-4 py-3">年齡</th>
              <th className="px-4 py-3">資產</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">
                  {new Date(l.created_at).toLocaleString("zh-TW")}
                </td>
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3 text-gray-600">{l.email}</td>
                <td className="px-4 py-3">{l.plans?.[0] || "—"}{l.plans?.length > 1 ? ` +${l.plans.length - 1}` : ""}</td>
                <td className="px-4 py-3">{l.age_range}</td>
                <td className="px-4 py-3">{l.asset_total ? `${(l.asset_total / 10000).toLocaleString("zh-TW")} 萬` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[l.status]}`}>
                    {STATUS_LABEL[l.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/${l.id}`} className="text-brand-dark font-medium">
                    查看 →
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-10">
                  尚無資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
