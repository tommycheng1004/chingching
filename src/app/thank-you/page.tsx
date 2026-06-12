export default function ThankYou({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email || "";
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-brand p-8 text-center">
        <div className="text-6xl mb-4">💌</div>
        <h1 className="text-2xl font-bold text-brand-dark mb-3">送出成功！</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          您的個人化財務健檢報告書<br />
          已寄送至
          {email ? (
            <span className="block mt-2 font-semibold text-brand-dark break-all">{email}</span>
          ) : (
            "您填寫的信箱"
          )}
        </p>
        <div className="bg-brand-light rounded-md p-4 text-left text-xs text-ink-soft leading-relaxed space-y-1">
          <p>📨 信通常會在 1–3 分鐘內送達</p>
          <p>📂 如果沒看到，請檢查<strong>垃圾郵件匣</strong></p>
          <p>📞 我會在 24 小時內透過您選擇的聯繫方式跟您聯絡</p>
        </div>
        <p className="text-xs text-ink-muted mt-6">一針見血理財術　·　晴晴護理師 🌸</p>
      </div>
    </main>
  );
}
