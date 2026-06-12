import { firestore, LEADS, tsToIso } from "@/lib/firebase";
import { Lead } from "@/types";
import Charts from "./Charts";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const snap = await firestore().collection(LEADS).get();
  const leads = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
    created_at: tsToIso(d.data().created_at),
  })) as Lead[];

  const total = leads.length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = leads.filter((l) => new Date(l.created_at) >= monthStart).length;
  const contacted = leads.filter((l) => l.status !== "new").length;
  const closed = leads.filter((l) => l.status === "closed").length;

  const byAge = bucketCount(leads, "age_range");
  const byOccupation = bucketCount(leads, "occupation");
  const byPlan = arrayCount(leads, "plans");
  const byDistrict = bucketCount(leads, "district");

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">儀表板</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="總名單" value={total} />
        <Stat label="本月新增" value={thisMonth} />
        <Stat label="已聯絡" value={contacted} sub={pct(contacted, total)} />
        <Stat label="已成交" value={closed} sub={pct(closed, total)} />
      </div>
      <Charts byAge={byAge} byFund={byOccupation} byPlan={byPlan} byTime={byDistrict} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
function pct(n: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`;
}
function bucketCount<T extends keyof Lead>(leads: Lead[], key: T) {
  const m = new Map<string, number>();
  for (const l of leads) {
    const v = String(l[key]);
    m.set(v, (m.get(v) || 0) + 1);
  }
  return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
}
function arrayCount(leads: Lead[], key: "experience" | "goals" | "plans" | "debts" | "protection") {
  const m = new Map<string, number>();
  for (const l of leads) {
    for (const v of (l[key] as string[]) || []) m.set(v, (m.get(v) || 0) + 1);
  }
  return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
}
