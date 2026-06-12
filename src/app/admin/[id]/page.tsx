import { firestore, LEADS, tsToIso } from "@/lib/firebase";
import { Lead } from "@/types";
import { notFound } from "next/navigation";
import UpdateForm from "./UpdateForm";

export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const snap = await firestore().collection(LEADS).doc(params.id).get();
  if (!snap.exists) return notFound();
  const l = { id: snap.id, ...(snap.data() as any), created_at: tsToIso(snap.data()!.created_at) } as Lead;

  const fmt = (n: number) => n.toLocaleString("zh-TW");
  const fields: [string, React.ReactNode][] = [
    ["建立時間", new Date(l.created_at).toLocaleString("zh-TW")],
    ["姓名", l.name],
    ["Email", l.email],
    ["聯繫方式", `${l.contact_method}：${l.contact_value}`],
    ["年齡 / 職業", `${l.age_range} ／ ${l.occupation}`],
    ["家庭狀況", l.family],
    ["月收入", `${fmt(l.monthly_income)} 元`],
    ["月開銷", `${fmt(l.monthly_expense)} 元`],
    ["每月可儲蓄", `${fmt(l.monthly_saving)} 元`],
    ["緊急備用金", `${fmt(l.reserve_amount)} 元`],
    ["累積資產", `${fmt(l.asset_total)} 元`],
    ["可動用現金", `${fmt(l.cash_liquid)} 元`],
    ["負債", `${l.debts.join("、")}${l.debt_amount ? `（${l.debt_amount}）` : ""}`],
    ["目標", `${l.goals.join("、")}${l.goals_other ? `（${l.goals_other}）` : ""}`],
    ["時間軸", l.horizon],
    ["投資經驗", l.experience.join("、")],
    ["風險承受度", l.risk],
    ["保險規劃", `${l.protection.join("、")}${l.premium ? `（年保費 ${l.premium}）` : ""}`],
    ["進階議題", l.advanced_topics.length ? l.advanced_topics.join("、") : "—"],
    ["諮詢方案", l.plans.join("、")],
    ["預約時段", l.booked_slot],
    ["方便地區", l.district],
    ["備註", l.note || "—"],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-lg border p-6">
        <h1 className="text-lg font-bold mb-4">{l.name}　<span className="text-sm font-normal text-gray-500">{l.email}</span></h1>
        <dl className="space-y-3 text-sm">
          {fields.map(([k, v]) => (
            <div key={k} className="flex">
              <dt className="w-28 text-gray-500">{k}</dt>
              <dd className="flex-1 text-gray-800">{v}</dd>
            </div>
          ))}
        </dl>
        {l.report_url && (
          <a
            href={l.report_url}
            target="_blank"
            className="inline-block mt-6 rounded-md bg-brand text-white px-4 py-2 text-sm"
          >
            📄 下載已寄出的 PDF 報告
          </a>
        )}
      </div>

      <UpdateForm id={l.id} status={l.status} notes={l.notes || ""} />
    </div>
  );
}
