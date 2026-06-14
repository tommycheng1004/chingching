"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ---------- 選項常數 ----------
const AGES = ["20-25 歲","26-30 歲","31-35 歲","36-40 歲","41-50 歲","51-60 歲","60 歲以上"] as const;
const OCCUPATIONS = ["上班族（一般受僱）","主管／管理職","軍公教","醫療專業","科技工程師","金融／法律專業","創業／自由工作者","業務／服務業","家管／無業中","學生","退休","其他"] as const;
const FAMILIES = ["單身","伴侶（未婚／同居規劃中）","已婚 — 無子女","已婚 — 有子女","不便透露"] as const;
const CONTACT_METHODS = [
  { value: "Line", icon: "💬", label: "Line", placeholder: "請輸入 Line ID" },
  { value: "IG", icon: "📷", label: "Instagram", placeholder: "請輸入 IG 帳號（@username）" },
] as const;

const DEBT_OPTS = [
  { v: "無負債", desc: "目前沒有任何借款或循環利息" },
  { v: "房貸", desc: "每月固定攤還的不動產貸款" },
  { v: "車貸", desc: "汽機車分期貸款" },
  { v: "信用卡循環/分期", desc: "信用卡未繳清產生的循環利息或分期" },
  { v: "信用貸款", desc: "個人小額信貸或銀行信用貸款" },
  { v: "學貸", desc: "就學貸款仍在還款中" },
  { v: "親友借款", desc: "向家人或朋友借的款項" },
] as const;
const DEBT_AMOUNTS = ["10 萬以下","10 - 50 萬","50 - 100 萬","100 - 300 萬","300 - 500 萬","500 - 1,000 萬","1,000 萬以上","不便透露"] as const;

const GOAL_OPTS = [
  { v: "建立緊急備用金", desc: "先準備好 3-6 個月的生活費，安心打底" },
  { v: "買房／換屋", desc: "頭期款累積、貸款承擔評估" },
  { v: "子女教育金", desc: "為孩子未來的學費與留學基金做準備" },
  { v: "安心退休（65歲後）", desc: "維持理想的退休生活水準" },
  { v: "被動收入現金流", desc: "透過股息、租金等讓資產持續產出收入" },
  { v: "資產增值/打敗通膨", desc: "讓現有資金不被通膨吃掉，效率運轉" },
  { v: "圓夢基金", desc: "提早退休、長期旅行、進修、創業、自我實現的資金" },
] as const;

const HORIZONS = [
  { v: "短期（1-3 年）", t: "短期目標（1 - 3 年）", desc: "緊急備用金、近期大額支出、頭期款" },
  { v: "中期（3-10 年）", t: "中期目標（3 - 10 年）", desc: "買房、結婚、創業、孩子學齡基金" },
  { v: "長期（10 年以上）", t: "長期目標（10 年以上）", desc: "退休規劃、財務獨立、資產傳承" },
  { v: "希望全面盤點", t: "希望全面盤點", desc: "短中長期一起看，整體釐清" },
] as const;

const EXPERIENCE_OPTS = [
  { v: "定存/活存", t: "定存／活存", desc: "主要把錢放在銀行" },
  { v: "股票", t: "股票（個股）", desc: "買賣台股或海外個股" },
  { v: "ETF/指數型", t: "ETF／指數型基金", desc: "0050、VOO、VT 這類被動投資" },
  { v: "基金", t: "共同基金", desc: "主動式基金、定期定額" },
  { v: "保單/儲蓄險", t: "保單／儲蓄險", desc: "投資型保單、利變型壽險、儲蓄險" },
  { v: "不動產", t: "不動產投資", desc: "收租或買賣房產（投資用，不含自住）" },
  { v: "加密貨幣", t: "加密貨幣", desc: "BTC、ETH 等數位資產" },
  { v: "完全沒經驗", t: "完全沒經驗", desc: "想從頭開始了解" },
] as const;

const RISKS = [
  { v: "保守型 (0-5%)", t: "保守型", desc: "不能接受本金虧損，最多 5% 內波動" },
  { v: "穩健型 (5-15%)", t: "穩健型", desc: "可接受 5 - 15% 的短期下跌，追求穩定成長" },
  { v: "積極型 (15-30%)", t: "積極型", desc: "可接受 15 - 30% 下跌，追求中高報酬" },
  { v: "進取型 (30%以上)", t: "進取型", desc: "可承受 30% 以上波動，追求長期高成長" },
  { v: "不確定，需要評估", t: "不確定", desc: "希望透過諮詢一起評估自己的風險屬性" },
] as const;

const PROTECTIONS = ["醫療險","壽險","意外險","重大疾病/癌症險","儲蓄/投資型保單","尚未規劃"] as const;
const PREMIUMS = ["1 萬以下","1 - 3 萬","3 - 6 萬","6 - 10 萬","10 - 20 萬","20 萬以上"] as const;
const ADVANCED = [
  { v: "不了解自己狀況", desc: "想先全面盤點，找出該優先處理的方向" },
  { v: "保單健診", desc: "" },
  { v: "稅務規劃", desc: "" },
  { v: "資產傳承", desc: "" },
  { v: "海外配置", desc: "" },
  { v: "債務整合", desc: "" },
] as const;

// 顧問的 Google Calendar 預約連結（之後請改成顧問自己的）
const DEFAULT_BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendar.app.google/example";

const PLANS = [
  {
    v: "免費財務報告", price: "FREE", badge: "FREE",
    tagline: "給想先了解自己財務狀況的你",
    bullets: ["依你填寫的資料客製專屬財務報告書", "資產／負債／現金流健檢概覽", "可作為後續諮詢的討論基礎"],
    hint: "完全免費，先看看自己的財務體質 📄",
  },
  {
    v: "30 分鐘諮詢", price: "面議", badge: "",
    tagline: "給想快速釐清單一問題的你",
    bullets: ["聚焦你最在意的 1–2 個財務問題", "快速給出方向與下一步建議", "適合第一次接觸、想先聊聊"],
    hint: "",
  },
  {
    v: "60 分鐘諮詢", price: "面議", badge: "",
    tagline: "給想完整盤點財務方向的你",
    bullets: ["完整財務體檢：資產、負債、現金流", "短中長期目標的存款／投資路徑討論", "保障與投資配置建議"],
    hint: "",
  },
  {
    v: "一對一財務陪跑", price: "NT$ 5,500", badge: "",
    tagline: "給想要長期養成財務體質的你",
    bullets: ["客製化 6 堂專屬諮詢課", "完整財務配置與資產調整建議", "線上課程不限時觀看，邊學邊執行"],
    hint: "",
  },
] as const;

const STEPS = [
  { num: 1, icon: "👤", title: "基本資訊" },
  { num: 2, icon: "💰", title: "財務現況" },
  { num: 3, icon: "🎯", title: "財務目標" },
  { num: 4, icon: "📊", title: "投資與保障" },
  { num: 5, icon: "📅", title: "預約諮詢" },
];

type FormState = {
  name: string; email: string;
  contact_method: string; contact_value: string;
  age_range: string; occupation: string; family: string;
  monthly_income: number | ""; monthly_expense: number | ""; monthly_saving: number | "";
  reserve_amount: number | ""; asset_total: number | ""; cash_liquid: number | "";
  debts: string[]; debt_amount: string;
  goals: string[]; goals_other: string; horizon: string;
  experience: string[]; risk: string; protection: string[]; premium: string;
  advanced_topics: string[];
  plans: string[]; booked_slot: string; district: string; note: string;
};

const EMPTY: FormState = {
  name: "", email: "", contact_method: "", contact_value: "",
  age_range: "", occupation: "", family: "",
  monthly_income: "", monthly_expense: "", monthly_saving: "",
  reserve_amount: "", asset_total: "", cash_liquid: "",
  debts: [], debt_amount: "",
  goals: [], goals_other: "", horizon: "",
  experience: [], risk: "", protection: [], premium: "",
  advanced_topics: [],
  plans: [], booked_slot: "", district: "", note: "",
};

export default function FormPage({ bookingUrl }: { bookingUrl?: string }) {
  const BOOKING_URL = bookingUrl || DEFAULT_BOOKING_URL;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleMulti(k: keyof FormState, v: string, opts?: { max?: number; exclusive?: string }) {
    setForm((f) => {
      const arr = f[k] as string[];
      let next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      if (opts?.exclusive) {
        if (v === opts.exclusive) next = arr.includes(v) ? [] : [opts.exclusive];
        else next = next.filter((x) => x !== opts.exclusive);
      }
      if (opts?.max && next.length > opts.max) next = next.slice(-opts.max);
      return { ...f, [k]: next };
    });
  }

  function bumpNum(k: keyof FormState, delta: number) {
    setForm((f) => {
      const cur = typeof f[k] === "number" ? (f[k] as number) : 0;
      return { ...f, [k]: Math.max(0, cur + delta) };
    });
  }

  function validate(n: number): string | null {
    if (n === 1) {
      if (!form.name.trim()) return "請填寫姓名";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "請填寫正確的電子郵件";
      if (!form.contact_method) return "請選擇主要聯繫方式";
      if (!form.contact_value.trim()) return "請填寫聯繫方式的帳號／號碼";
      if (!form.age_range) return "請選擇年齡層";
      if (!form.occupation) return "請選擇職業類別";
      if (!form.family) return "請選擇家庭狀況";
    }
    if (n === 2) {
      if (form.monthly_income === "") return "請填寫月收入";
      if (form.monthly_expense === "") return "請填寫月開銷";
      if (form.monthly_saving === "") return "請填寫每月可儲蓄／投資金額";
      if (form.reserve_amount === "") return "請填寫緊急備用金";
      if (form.asset_total === "") return "請填寫資產規模";
      if (form.cash_liquid === "") return "請填寫可動用現金";
      if (form.debts.length === 0) return "請選擇負債情況（無負債也要勾）";
      if (form.debts.some((d) => d !== "無負債") && !form.debt_amount) return "請選擇負債總額區間";
    }
    if (n === 3) {
      if (form.goals.length === 0) return "請至少選擇 1 個目標";
      if (!form.horizon) return "請選擇關注的時間軸";
    }
    if (n === 4) {
      if (form.experience.length === 0) return "請至少選擇 1 項投資經驗";
      if (!form.risk) return "請選擇風險承受度";
      if (form.protection.length === 0) return "請至少選擇 1 項保險規劃";
    }
    if (n === 5) {
      if (form.plans.length === 0) return "請至少選擇一個諮詢方案";
      if (!form.booked_slot.trim()) return "請先到 Google 行事曆預約並填寫已預約的時段";
      if (!form.district.trim()) return "請填寫方便的地區";
    }
    return null;
  }

  function goNext() {
    const err = validate(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goPrev() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const err = validate(5);
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "送出失敗，請稍後再試");
      router.push(`/thank-you?email=${encodeURIComponent(form.email)}`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      {submitting && <GeneratingOverlay />}
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-10">
        {/* 標題 */}
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1">一針見血理財術</h1>
          <p className="text-sm text-ink-muted">晴晴護理師 ｜ 一針見血，找出專屬於你的財務目標 🌸</p>
        </header>

        {/* 顧問自介（簡潔版） */}
        <div className="bg-white rounded-md border border-gray-100 p-5 mb-5 text-sm text-ink-soft leading-relaxed">
          <p className="mb-2">哈囉，我是您的專屬財務顧問 晴晴 👩‍⚕️</p>
          <p className="mb-2">
            希望用一針見血的方式找出專屬於你的財務目標和想法，來了解自己內心需求！
          </p>
          <p className="mb-2">
            這份表單沒有對錯答案，只是讓我更了解你，一起完成你的目標 🌸
          </p>
          <p className="text-xs text-ink-muted mt-3 pt-3 border-t border-gray-100">
            <span className="text-red-500">*</span> 為必填欄位　·　資訊絕對保密
          </p>
        </div>

        {/* 進度條 */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div className={`flex flex-col items-center flex-1 ${step >= s.num ? "text-brand-dark" : "text-ink-muted/60"}`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg mb-1 transition shadow-sm ${
                    step >= s.num ? "bg-step-grad text-white" : "bg-white border border-gray-200 text-gray-300"
                  }`}>{s.icon}</div>
                  <span className="text-[9px] sm:text-xs font-medium whitespace-nowrap">
                    <span className="hidden sm:inline">STEP {s.num}</span>
                    <span className="sm:hidden">{s.num}</span>
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 -mt-5 ${step > s.num ? "bg-brand" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-4 sm:p-6 space-y-6">
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} bump={bumpNum} toggle={toggleMulti} />}
          {step === 3 && <Step3 form={form} set={set} toggle={toggleMulti} />}
          {step === 4 && <Step4 form={form} set={set} toggle={toggleMulti} />}
          {step === 5 && <Step5 form={form} set={set} toggle={toggleMulti} bookingUrl={BOOKING_URL} />}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button onClick={goPrev} className="rounded-lg border-2 border-gray-200 px-5 py-3 text-sm font-medium text-ink-soft hover:bg-gray-50 transition">← 上一步</button>
            )}
            {step < 5 ? (
              <button onClick={goNext} className="flex-1 rounded-lg bg-step-grad py-3 text-white font-semibold hover:opacity-90 transition shadow-brand">下一步 →</button>
            ) : (
              <button onClick={submit} disabled={submitting} className="flex-1 rounded-lg bg-step-grad py-3 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 shadow-brand">
                {submitting ? "生成報告中… 約需 5 秒" : "✨ 送出諮詢申請"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          送出後我會在 24 小時內主動聯繫你 ✨　·　所有資訊僅用於諮詢用途，不會分享給第三方。
        </p>
      </div>
    </main>
  );
}

// ---------- 共用元件 ----------
function GeneratingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4 animate-pulse">📊</div>
        <h2 className="text-xl font-bold text-brand-dark mb-2">正在為您生成個人化財務報告書</h2>
        <p className="text-sm text-ink-soft mb-6">
          系統正在分析您的填答內容、計算 5 大面向評分、生成 14 頁完整報告書並寄送至您的信箱⋯⋯
        </p>
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-xs text-ink-muted mt-6">約需 5–10 秒，請稍候不要關閉視窗 🙏</p>
      </div>
    </div>
  );
}

function SectionTag({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <h2 className="text-sm sm:text-base font-semibold text-brand-dark mb-1">
        STEP {num} ／ {title}
      </h2>
      <p className="text-xs text-ink-muted">{desc}</p>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm sm:text-[15px] font-semibold text-ink mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-ink-muted mb-2">{hint}</p>}
      <div>{children}</div>
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full border-b-2 border-gray-200 py-2 text-base sm:text-sm focus:outline-none focus:border-brand bg-transparent ${props.className || ""}`} />;
}

function Select({ value, onChange, options, placeholder = "請選擇" }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-brand">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function OptCard({ on, onClick, title, desc, children }: { on: boolean; onClick: () => void; title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-md border px-3 py-2 transition flex items-start gap-2.5 ${
        on ? "border-brand bg-brand-light/60" : "border-gray-200 bg-white hover:border-brand/50 hover:bg-gray-50/50"
      }`}>
      <span className={`mt-0.5 text-sm leading-none ${on ? "text-brand" : "text-gray-300"}`}>{on ? "☑" : "☐"}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${on ? "text-brand-dark font-medium" : "text-ink"}`}>{title}</div>
        {desc && <div className="text-[11px] text-ink-muted mt-0.5 leading-snug">{desc}</div>}
        {children}
      </div>
    </button>
  );
}

function RadioCard({ on, onClick, title, desc }: { on: boolean; onClick: () => void; title: string; desc?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-md border px-3 py-2 transition flex items-start gap-2.5 ${
        on ? "border-brand bg-brand-light/60" : "border-gray-200 bg-white hover:border-brand/50 hover:bg-gray-50/50"
      }`}>
      <span className={`mt-0.5 text-sm leading-none ${on ? "text-brand" : "text-gray-300"}`}>{on ? "●" : "○"}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${on ? "text-brand-dark font-medium" : "text-ink"}`}>{title}</div>
        {desc && <div className="text-[11px] text-ink-muted mt-0.5 leading-snug">{desc}</div>}
      </div>
    </button>
  );
}

function NumInput({ value, onChange, step, placeholder, suffix }: { value: number | ""; onChange: (v: number | "") => void; step: number; placeholder: string; suffix: string }) {
  const bump = (delta: number) => onChange(Math.max(0, (typeof value === "number" ? value : 0) + delta));
  const wan = typeof value === "number" && value > 0 ? `約 ${(value / 10000).toLocaleString("zh-TW", { maximumFractionDigits: 1 })} 萬` : "";
  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white focus-within:border-brand px-3 py-2">
      <input type="number" inputMode="numeric" min={0} step={step} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="flex-1 text-base sm:text-sm focus:outline-none bg-transparent appearance-none" />
      <span className="text-xs text-ink-muted whitespace-nowrap">{wan || suffix}</span>
      <div className="flex flex-col">
        <button type="button" onClick={() => bump(step)} className="text-brand text-[10px] hover:bg-brand-light px-1 leading-none py-0.5 rounded">▲</button>
        <button type="button" onClick={() => bump(-step)} className="text-brand text-[10px] hover:bg-brand-light px-1 leading-none py-0.5 rounded">▼</button>
      </div>
    </div>
  );
}

// ---------- STEP 1 ----------
function Step1({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <>
      <SectionTag num={1} title="基本資訊" desc="先讓我認識你，這些都是聯繫用的基本資料。" />

      <Field label="姓名" required>
        <TextInput placeholder="請輸入姓名" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
      </Field>

      <Field label="電子郵件" required hint="我會傳一份簡單的免費財務報告書給你參考">
        <TextInput type="email" placeholder="your@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
      </Field>

      <Field label="主要聯繫方式" required hint="選一個你最常使用的，方便我與你聯繫">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {CONTACT_METHODS.map((m) => (
            <button key={m.value} type="button" onClick={() => set("contact_method", m.value)}
              className={`flex flex-col items-center gap-1 rounded-md border py-2.5 transition ${
                form.contact_method === m.value ? "border-brand bg-brand-light/60" : "border-gray-200 hover:border-brand/50"
              }`}>
              <span className="text-xl">{m.icon}</span>
              <span className={`text-xs ${form.contact_method === m.value ? "text-brand-dark font-medium" : "text-ink"}`}>{m.label}</span>
            </button>
          ))}
        </div>
        {form.contact_method && (
          <TextInput placeholder={CONTACT_METHODS.find((m) => m.value === form.contact_method)?.placeholder}
            value={form.contact_value} onChange={(e) => set("contact_value", e.target.value)} />
        )}
      </Field>

      <Field label="年齡層" required>
        <Select value={form.age_range} onChange={(v) => set("age_range", v)} options={AGES} />
      </Field>

      <Field label="職業類別" required>
        <Select value={form.occupation} onChange={(v) => set("occupation", v)} options={OCCUPATIONS} />
      </Field>

      <Field label="家庭狀況" required>
        <Select value={form.family} onChange={(v) => set("family", v)} options={FAMILIES} />
      </Field>
    </>
  );
}

// ---------- STEP 2 ----------
function Step2({ form, set, bump, toggle }: { form: FormState; set: any; bump: (k: keyof FormState, d: number) => void; toggle: any }) {
  const hasRealDebt = form.debts.some((d) => d !== "無負債");
  return (
    <>
      <SectionTag num={2} title="財務現況" desc="用區間就好，不需要精確金額，讓我先掌握大致樣貌。" />

      <Field label="月收入（個人）" required hint="請填入實際金額，可用上下按鈕快速調整（每次 ±5,000）">
        <NumInput value={form.monthly_income} onChange={(v) => set("monthly_income", v)} step={5000} placeholder="例如：60000" suffix="元 / 月" />
      </Field>
      <Field label="平均月開銷" required hint="含房租房貸、伙食、交通、保費、娛樂等所有支出（每次 ±5,000）">
        <NumInput value={form.monthly_expense} onChange={(v) => set("monthly_expense", v)} step={5000} placeholder="例如：30000" suffix="元 / 月" />
      </Field>
      <Field label="每月可儲蓄／投資的金額" required hint="收入減去日常支出後可留下的金額（每次 ±1,000）">
        <NumInput value={form.monthly_saving} onChange={(v) => set("monthly_saving", v)} step={1000} placeholder="例如：15000" suffix="元 / 月" />
      </Field>
      <Field label="緊急備用金" required hint="目前已準備好的緊急預備金總額（每次 ±10,000）">
        <NumInput value={form.reserve_amount} onChange={(v) => set("reserve_amount", v)} step={10000} placeholder="例如：200000" suffix="元" />
      </Field>
      <Field label="目前累積的資產規模" required hint="含存款、股票、基金、保單現金價值等（不含自住房產，每次 ±100,000）">
        <NumInput value={form.asset_total} onChange={(v) => set("asset_total", v)} step={100000} placeholder="例如：1500000" suffix="元" />
      </Field>
      <Field label="可隨時動用的現金" required hint="數位活存、定存、貨幣型基金等可即刻變現的資產（每次 ±10,000）">
        <NumInput value={form.cash_liquid} onChange={(v) => set("cash_liquid", v)} step={10000} placeholder="例如：300000" suffix="元" />
      </Field>

      <Field label="目前的負債情況" required hint="可複選">
        <div className="space-y-1.5">
          {DEBT_OPTS.map((o) => (
            <OptCard key={o.v} on={form.debts.includes(o.v)} onClick={() => toggle("debts", o.v, { exclusive: "無負債" })} title={o.v} desc={o.desc} />
          ))}
        </div>
        {hasRealDebt && (
          <div className="mt-3 rounded-md bg-gray-50 p-3 border border-gray-100">
            <div className="text-xs font-semibold text-ink mb-1">大概的負債總額</div>
            <div className="text-xs text-ink-muted mb-2">不確定也沒關係，估個區間就好</div>
            <Select value={form.debt_amount} onChange={(v) => set("debt_amount", v)} options={DEBT_AMOUNTS} />
          </div>
        )}
      </Field>
    </>
  );
}

// ---------- STEP 3 ----------
function Step3({ form, set, toggle }: { form: FormState; set: any; toggle: any }) {
  return (
    <>
      <SectionTag num={3} title="財務目標" desc="想往哪走？讓我了解你心中重要的事。" />

      <Field label="你最想實現的財務目標" required hint="可複選，最多 3 項">
        <div className="space-y-1.5">
          {GOAL_OPTS.map((o) => (
            <OptCard key={o.v} on={form.goals.includes(o.v)} onClick={() => toggle("goals", o.v, { max: 3 })} title={o.v} desc={o.desc} />
          ))}
          <OptCard on={form.goals.includes("其他")} onClick={() => toggle("goals", "其他", { max: 3 })} title="其他">
            {form.goals.includes("其他") && (
              <TextInput className="mt-2" placeholder="請補充⋯⋯" value={form.goals_other} onChange={(e) => set("goals_other", e.target.value)} />
            )}
          </OptCard>
        </div>
      </Field>

      <Field label="最關心的時間軸" required hint="這次想優先聚焦的時間範圍">
        <div className="space-y-1.5">
          {HORIZONS.map((o) => (
            <RadioCard key={o.v} on={form.horizon === o.v} onClick={() => set("horizon", o.v)} title={o.t} desc={o.desc} />
          ))}
        </div>
      </Field>
    </>
  );
}

// ---------- STEP 4 ----------
function Step4({ form, set, toggle }: { form: FormState; set: any; toggle: any }) {
  const hasInsurance = form.protection.some((p) => p !== "尚未規劃");
  return (
    <>
      <SectionTag num={4} title="投資、風險與保障" desc="了解你的投資經驗、風險偏好與保障規劃現況。" />

      <Field label="過去的投資經驗" required hint="可複選">
        <div className="space-y-1.5">
          {EXPERIENCE_OPTS.map((o) => (
            <OptCard key={o.v} on={form.experience.includes(o.v)} onClick={() => toggle("experience", o.v, { exclusive: "完全沒經驗" })} title={o.t} desc={o.desc} />
          ))}
        </div>
      </Field>

      <Field label="你的風險承受度" required hint="如果一年內帳面下跌，你最能接受的幅度">
        <div className="space-y-1.5">
          {RISKS.map((o) => (
            <RadioCard key={o.v} on={form.risk === o.v} onClick={() => set("risk", o.v)} title={o.t} desc={o.desc} />
          ))}
        </div>
      </Field>

      <Field label="目前的保險規劃" required hint="可複選">
        <div className="space-y-1.5">
          {PROTECTIONS.map((p) => (
            <OptCard key={p} on={form.protection.includes(p)} onClick={() => toggle("protection", p, { exclusive: "尚未規劃" })} title={p} />
          ))}
        </div>
        {hasInsurance && (
          <div className="mt-3 rounded-md bg-gray-50 p-3 border border-gray-100">
            <div className="text-xs font-semibold text-ink mb-1">每年保費支出</div>
            <div className="text-xs text-ink-muted mb-2">不清楚的話可不填寫</div>
            <Select value={form.premium} onChange={(v) => set("premium", v)} options={PREMIUMS} placeholder="不填寫" />
          </div>
        )}
      </Field>

      <Field label="想進一步了解的議題" hint="可複選（選填）">
        <div className="space-y-1.5">
          {ADVANCED.map((o) => (
            <OptCard key={o.v} on={form.advanced_topics.includes(o.v)} onClick={() => toggle("advanced_topics", o.v)} title={o.v} desc={o.desc} />
          ))}
        </div>
      </Field>
    </>
  );
}

// ---------- STEP 5 ----------
function Step5({ form, set, toggle, bookingUrl }: { form: FormState; set: any; toggle: any; bookingUrl: string }) {
  return (
    <>
      <SectionTag num={5} title="預約諮詢" desc="第一次接觸完全免費，先聊聊看適不適合你。" />

      <Field label="選擇你的諮詢方案" required hint="可複選，點選展開服務內容">
        <div className="space-y-1.5">
          {PLANS.map((p) => {
            const on = form.plans.includes(p.v);
            return (
              <div key={p.v} className={`rounded-md border transition overflow-hidden ${on ? "border-brand bg-brand-light/60" : "border-gray-200 bg-white"}`}>
                <button type="button" onClick={() => toggle("plans", p.v)} className="w-full text-left px-3 py-2 flex items-center gap-2">
                  <span className={`text-sm ${on ? "text-brand" : "text-gray-300"}`}>{on ? "☑" : "☐"}</span>
                  <span className={`text-sm ${on ? "text-brand-dark font-medium" : "text-ink"}`}>{p.v}</span>
                  {p.badge && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">{p.badge}</span>
                  )}
                  <span className="ml-auto text-xs font-semibold text-brand-dark">{p.price}</span>
                </button>
                {on && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 ml-6">
                    <div className="text-[11px] text-brand-dark mb-1.5 mt-2">{p.tagline}</div>
                    <ul className="text-xs text-ink-soft space-y-0.5 pl-4 list-disc">
                      {p.bullets.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                    {p.hint && <div className="text-[11px] text-ink-muted mt-2">{p.hint}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Field>

      <Field label="線上預約諮詢時段" required hint="點按鈕到我的 Google 行事曆挑時段，回來再填寫已預約的時間">
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center rounded-md border-2 border-brand bg-brand-light/60 hover:bg-brand-light text-brand-dark font-medium py-3 mb-3 transition">
          🗓️　前往 Google 行事曆預約　→
        </a>
        <TextInput placeholder="範例：2026/05/20 14:00" value={form.booked_slot}
          onChange={(e) => set("booked_slot", e.target.value)} />
        <p className="text-[11px] text-ink-muted mt-1">完成預約後請回來填寫您預約的日期時間，方便我交叉確認</p>
      </Field>

      <Field label="方便的地區（諮詢採現場面談）" required hint="例：台北信義 / 新北板橋 / 台北大安⋯⋯">
        <TextInput placeholder="例：台北信義" value={form.district} onChange={(e) => set("district", e.target.value)} />
      </Field>

      <Field label="想先告訴我的話" hint="任何想補充的：限定的日期時間、特別關心的議題⋯⋯（選填）">
        <textarea rows={4} placeholder="例：希望聚焦在目前股票部位過於集中的問題"
          value={form.note} onChange={(e) => set("note", e.target.value)}
          className="w-full rounded-md border border-gray-200 p-3 text-base sm:text-sm focus:outline-none focus:border-brand bg-white" />
      </Field>
    </>
  );
}
