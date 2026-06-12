import {
  AgeBucket, AssetBucket, CashflowHealth, ExpBucket, FormPayload, ReserveHealth, RiskBucket,
} from "@/types";
import { CONTENT, AllocationItem } from "@/pdf/content";

// ───────── Bucket 計算 ─────────
export function bucketAge(age: FormPayload["age_range"]): AgeBucket {
  if (age === "20-25 歲" || age === "26-30 歲") return "young";
  if (age === "31-35 歲" || age === "36-40 歲" || age === "41-50 歲") return "mid";
  return "senior";
}
export function bucketAsset(t: number): AssetBucket {
  if (t < 500_000) return "small";
  if (t < 3_000_000) return "medium";
  return "large";
}
export function bucketExp(exp: FormPayload["experience"]): ExpBucket {
  const s = new Set(exp);
  if (s.has("加密貨幣") || s.has("不動產") || s.has("股票")) return "advanced";
  if (s.has("ETF/指數型") || s.has("基金") || s.has("保單/儲蓄險")) return "intermediate";
  return "novice";
}
export function bucketRisk(r: FormPayload["risk"]): RiskBucket {
  if (r === "保守型 (0-5%)" || r === "不確定，需要評估") return "conservative";
  if (r === "積極型 (15-30%)" || r === "進取型 (30%以上)") return "aggressive";
  return "balanced";
}

// ───────── 五大面向評分 (0-100) ─────────
export interface SubScore { key: string; label: string; score: number; level: "良好" | "尚可" | "待加強" }

function levelOf(score: number): SubScore["level"] {
  if (score >= 70) return "良好";
  if (score >= 40) return "尚可";
  return "待加強";
}

/** 儲蓄能力：依「儲蓄率 = monthly_saving / monthly_income」 */
export function scoreSaving(p: FormPayload): SubScore {
  const rate = p.monthly_income > 0 ? p.monthly_saving / p.monthly_income : 0;
  let score: number;
  if (rate >= 0.3) score = 100;
  else if (rate >= 0.2) score = 85;
  else if (rate >= 0.15) score = 76;
  else if (rate >= 0.1) score = 55;
  else if (rate >= 0.05) score = 35;
  else score = 15;
  return { key: "saving", label: "儲蓄能力", score, level: levelOf(score) };
}

/** 緊急備用：reserve_amount ÷ monthly_expense (個月) */
export function scoreReserve(p: FormPayload): SubScore {
  const months = p.monthly_expense > 0 ? p.reserve_amount / p.monthly_expense : 0;
  let score: number;
  if (months >= 6) score = 100;
  else if (months >= 3) score = 80;
  else if (months >= 1.5) score = 50;
  else if (months >= 0.5) score = 25;
  else score = 12;
  return { key: "reserve", label: "緊急備用", score, level: levelOf(score) };
}

/** 債務控制：無債滿分；有高利債扣最多 */
export function scoreDebt(p: FormPayload): SubScore {
  if (p.debts.includes("無負債") || p.debts.length === 0) {
    return { key: "debt", label: "債務控制", score: 100, level: "良好" };
  }
  const highInt = p.debts.includes("信用卡循環/分期") || p.debts.includes("信用貸款");
  const lowInt = p.debts.some((d) => ["房貸", "車貸", "學貸"].includes(d));
  let score = 100;
  if (highInt) score -= 60;
  else if (lowInt) score -= 20;
  return { key: "debt", label: "債務控制", score: Math.max(0, score), level: levelOf(Math.max(0, score)) };
}

/** 保障完整：六大保險覆蓋度 */
export function scoreProtection(p: FormPayload): SubScore {
  if (p.protection.includes("尚未規劃")) return { key: "protection", label: "保障完整", score: 0, level: "待加強" };
  const need = new Set(["醫療險", "意外險", "重大疾病/癌症險"]);
  const has = p.protection.filter((x) => need.has(x)).length;
  const extra = p.protection.filter((x) => x === "壽險" || x === "儲蓄/投資型保單").length;
  let score = (has / 3) * 80 + Math.min(extra, 2) * 10;
  return { key: "protection", label: "保障完整", score: Math.round(score), level: levelOf(Math.round(score)) };
}

/** 投資多元：投資經驗種類數 */
export function scoreInvest(p: FormPayload): SubScore {
  if (p.experience.includes("完全沒經驗")) return { key: "invest", label: "投資多元", score: 0, level: "待加強" };
  const kinds = p.experience.filter((x) => x !== "完全沒經驗").length;
  let score: number;
  if (kinds >= 4) score = 100;
  else if (kinds === 3) score = 80;
  else if (kinds === 2) score = 60;
  else if (kinds === 1) score = 35;
  else score = 0;
  return { key: "invest", label: "投資多元", score, level: levelOf(score) };
}

export function buildSubScores(p: FormPayload): SubScore[] {
  return [scoreSaving(p), scoreReserve(p), scoreDebt(p), scoreProtection(p), scoreInvest(p)];
}

export function overallScore(subs: SubScore[]): number {
  // 加權：儲蓄 25%、備用 20%、債務 20%、保障 20%、投資 15%
  const w = { saving: 0.25, reserve: 0.2, debt: 0.2, protection: 0.2, invest: 0.15 };
  return Math.round(subs.reduce((sum, s) => sum + s.score * (w as any)[s.key], 0));
}

export function priorityActions(subs: SubScore[]): { rank: number; text: string; score: number; tag: string }[] {
  // 由低分往高分排，挑 3 個
  const sorted = [...subs].sort((a, b) => a.score - b.score).slice(0, 3);
  return sorted.map((s, i) => {
    const text =
      s.key === "reserve" ? "先補足 3 個月緊急備用金" :
      s.key === "saving" ? "提升儲蓄率，目標月儲 20% 以上" :
      s.key === "debt" ? "清償高利率負債（信用卡 / 信貸）" :
      s.key === "protection" ? "補齊核心保險（醫療 / 意外 / 重大疾病）" :
      "建立分散的投資組合，提升夏普比率";
    return { rank: i + 1, text, score: s.score, tag: s.level };
  });
}

// ───────── 現金流診斷 ─────────
export interface CashflowDiagnosis { savingRatePct: number; health: CashflowHealth }
export function cashflowDiagnose(p: FormPayload): CashflowDiagnosis {
  const rate = p.monthly_income > 0 ? p.monthly_saving / p.monthly_income : 0;
  const ratePct = Math.round(rate * 100);
  let health: CashflowHealth = "ok";
  if (rate < 0.1) health = "tight";
  else if (rate >= 0.25) health = "healthy";
  return { savingRatePct: ratePct, health };
}

export interface ReserveDiagnosis { months: number; health: ReserveHealth }
export function reserveDiagnose(p: FormPayload): ReserveDiagnosis {
  const months = p.monthly_expense > 0 ? p.reserve_amount / p.monthly_expense : 0;
  const rounded = Math.round(months * 10) / 10;
  let health: ReserveHealth = "insufficient";
  if (rounded >= 6) health = "abundant";
  else if (rounded >= 3) health = "adequate";
  return { months: rounded, health };
}

export function hasHighInterestDebt(p: FormPayload): boolean {
  return p.debts.some((d) => d === "信用卡循環/分期" || d === "信用貸款");
}

export function pickAllocation(asset: AssetBucket, risk: RiskBucket) {
  return CONTENT.allocation[risk][asset];
}

// ───────── 10 年成長預測 ─────────
export function projectGrowth(p: FormPayload): { years: number; recommended: number; baseline: number }[] {
  const initial = p.asset_total;
  const monthly = p.monthly_saving;
  const r1 = 0.05, r2 = 0.01; // 建議配置 vs 純定存
  const out: { years: number; recommended: number; baseline: number }[] = [];
  for (let y = 0; y <= 10; y++) {
    out.push({
      years: y,
      recommended: compound(initial, monthly, r1, y),
      baseline: compound(initial, monthly, r2, y),
    });
  }
  return out;
}

function compound(initial: number, monthly: number, annualRate: number, years: number): number {
  const I = Number.isFinite(initial) ? initial : 0;
  const M = Number.isFinite(monthly) ? monthly : 0;
  const R = Number.isFinite(annualRate) ? annualRate : 0;
  if (years === 0) return I;
  const factor = Math.pow(1 + R, years);
  const annuity = R > 0 ? (factor - 1) / R : years;
  const v = I * factor + M * 12 * annuity;
  return Number.isFinite(v) ? Math.round(v) : 0;
}

// ───────── ABC 三方案 30 年複利 ─────────
export const PLAN_RATES = { A: 0.05, B: 0.09, C: 0.11 };
export function projectABC(p: FormPayload): { years: number; A: number; B: number; C: number }[] {
  const initial = p.asset_total;
  const m = p.monthly_saving;
  const out: { years: number; A: number; B: number; C: number }[] = [];
  for (let y = 0; y <= 30; y += 5) {
    out.push({
      years: y,
      A: compound(initial, m, PLAN_RATES.A, y),
      B: compound(initial, m, PLAN_RATES.B, y),
      C: compound(initial, m, PLAN_RATES.C, y),
    });
  }
  return out;
}

// ───────── 資產配置 — 實際 vs 建議 ─────────
export interface AllocationDiff { label: string; actual: number; suggested: number; diff: number }
export function configCompare(p: FormPayload, suggested: AllocationItem[]): AllocationDiff[] {
  // 實際比重：cash_liquid 算現金；其餘 (asset_total - cash_liquid) 我們不知道細項，先全歸入「不明」處理
  const total = Math.max(1, p.asset_total);
  const cashPct = Math.round((p.cash_liquid / total) * 100);
  const otherPct = Math.max(0, 100 - cashPct);

  const sugMap: Record<string, number> = {};
  for (const s of suggested) sugMap[s.label] = s.percent;

  // 標準化分類
  const labels = ["現金／定存", "債券", "全球股票", "另類資產"];
  const actualMap: Record<string, number> = {
    "現金／定存": cashPct,
    "債券": 0,
    "全球股票": 0,
    "另類資產": 0,
  };
  // 若使用者經驗有 ETF / 股票，估算 other 部位可能分散到全球股票
  if (otherPct > 0) {
    const exp = new Set(p.experience);
    if (exp.has("股票") || exp.has("ETF/指數型")) actualMap["全球股票"] += otherPct;
    else if (exp.has("基金")) actualMap["全球股票"] += otherPct;
    else actualMap["現金／定存"] += otherPct;
  }

  // 建議比重以類別對映
  const suggMap: Record<string, number> = {
    "現金／定存": (sugMap["現金／定存"] || 0) + (sugMap["緊急備用金"] || 0) + (sugMap["定存／貨幣基金"] || 0),
    "債券": (sugMap["債券／儲蓄險"] || 0) + (sugMap["債券／高息資產"] || 0) + (sugMap["投資級債券"] || 0),
    "全球股票": (sugMap["指數型 ETF"] || 0) + (sugMap["指數型 ETF（核心）"] || 0) + (sugMap["全球股票 ETF"] || 0) + (sugMap["全球成長型 ETF"] || 0) + (sugMap["個股／主題 ETF"] || 0) + (sugMap["個股／產業 ETF"] || 0) + (sugMap["主題型 ETF"] || 0) + (sugMap["主題／成長股"] || 0),
    "另類資產": (sugMap["不動產／另類"] || 0) + (sugMap["加密／另類"] || 0) + (sugMap["高風險試水"] || 0) + (sugMap["儲蓄／保險"] || 0) + (sugMap["儲蓄／投資型保單"] || 0) + (sugMap["保險／稅務規劃"] || 0),
  };

  // 若還有零和差，把剩餘塞回「全球股票」
  const sugSum = Object.values(suggMap).reduce((a, b) => a + b, 0);
  if (sugSum < 100) suggMap["全球股票"] += 100 - sugSum;

  return labels.map((l) => ({
    label: l,
    actual: actualMap[l] || 0,
    suggested: suggMap[l] || 0,
    diff: (actualMap[l] || 0) - (suggMap[l] || 0),
  }));
}

// ───────── 保險覆蓋矩陣 ─────────
export const PROTECTION_NEEDS = ["醫療險", "癌症險", "長照險", "壽險", "重大疾病", "意外險"] as const;
export function protectionMatrix(p: FormPayload): { name: string; have: boolean }[] {
  const set = new Set(p.protection);
  return PROTECTION_NEEDS.map((n) => {
    if (n === "癌症險" || n === "重大疾病") return { name: n, have: set.has("重大疾病/癌症險") };
    if (n === "長照險") return { name: n, have: false }; // 表單中沒問，預設未配置
    return { name: n, have: set.has(n) };
  });
}

// ───────── 主聚合 ─────────
export interface ReportData {
  payload: FormPayload;
  ageBucket: AgeBucket;
  assetBucket: AssetBucket;
  expBucket: ExpBucket;
  riskBucket: RiskBucket;
  subScores: SubScore[];
  overall: number;
  priorities: { rank: number; text: string; score: number; tag: string }[];
  cashflow: CashflowDiagnosis;
  reserve: ReserveDiagnosis;
  allocation: { text: string; items: AllocationItem[] };
  growth10y: ReturnType<typeof projectGrowth>;
  abc: ReturnType<typeof projectABC>;
  configDiff: AllocationDiff[];
  protectionGrid: ReturnType<typeof protectionMatrix>;
  reportNo: string;
  today: string;
}

export function buildReport(payload: FormPayload): ReportData {
  const ageBucket = bucketAge(payload.age_range);
  const assetBucket = bucketAsset(payload.asset_total);
  const expBucket = bucketExp(payload.experience);
  const riskBucket = bucketRisk(payload.risk);
  const subScores = buildSubScores(payload);
  const overall = overallScore(subScores);
  const priorities = priorityActions(subScores);
  const allocation = pickAllocation(assetBucket, riskBucket);
  const today = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
  const reportNo = `RPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    payload, ageBucket, assetBucket, expBucket, riskBucket,
    subScores, overall, priorities,
    cashflow: cashflowDiagnose(payload),
    reserve: reserveDiagnose(payload),
    allocation,
    growth10y: projectGrowth(payload),
    abc: projectABC(payload),
    configDiff: configCompare(payload, allocation.items),
    protectionGrid: protectionMatrix(payload),
    reportNo,
    today,
  };
}
