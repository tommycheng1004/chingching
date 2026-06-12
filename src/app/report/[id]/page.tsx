import { firestore, LEADS } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { Lead } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: { id: string } }) {
  const snap = await firestore().collection(LEADS).doc(params.id).get();
  if (!snap.exists) return notFound();
  const d = snap.data()!;
  if (!d.report_url) return notFound();
  const l = { id: snap.id, name: d.name, email: d.email, report_url: d.report_url } as Pick<Lead, "id" | "name" | "email" | "report_url">;

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-light to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-brand-dark mb-2">
            {l.name}，您的財務健檢報告已生成！
          </h1>
          <p className="text-gray-600 text-sm">
            點擊下方按鈕即可下載您的個人化 PDF 報告
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <a
              href={l.report_url!}
              download="financial-report.pdf"
              className="flex-1 text-center rounded-md bg-brand hover:bg-brand-dark text-white font-medium py-3 transition"
            >
              📥 下載 PDF 報告
            </a>
            <a
              href={l.report_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-md border-2 border-brand text-brand-dark font-medium py-3 hover:bg-brand-light transition"
            >
              👁 線上預覽
            </a>
          </div>
          <p className="text-xs text-gray-400 text-center">
            建議您下載並儲存報告，方便日後查閱
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <iframe
            src={l.report_url!}
            className="w-full h-[400px] sm:h-[600px] rounded-md border"
            title="財務健檢報告預覽"
          />
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>想針對個人狀況做更細的規劃？</p>
          <p className="mt-1">歡迎私訊 IG <span className="text-brand-dark font-medium">@your_ig_here</span> 預約一對一諮詢</p>
        </div>
      </div>
    </main>
  );
}
