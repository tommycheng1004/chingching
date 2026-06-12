export type AgeRange =
  | "20-25 歲"
  | "26-30 歲"
  | "31-35 歲"
  | "36-40 歲"
  | "41-50 歲"
  | "51-60 歲"
  | "60 歲以上";

export type Occupation =
  | "上班族（一般受僱）"
  | "主管／管理職"
  | "軍公教"
  | "醫療專業"
  | "科技工程師"
  | "金融／法律專業"
  | "創業／自由工作者"
  | "業務／服務業"
  | "家管／無業中"
  | "學生"
  | "退休"
  | "其他";

export type Family =
  | "單身"
  | "伴侶（未婚／同居規劃中）"
  | "已婚 — 無子女"
  | "已婚 — 有子女"
  | "不便透露";

export type ContactMethod = "Line" | "IG" | "手機";

export type Debt =
  | "無負債"
  | "房貸"
  | "車貸"
  | "信用卡循環/分期"
  | "信用貸款"
  | "學貸"
  | "親友借款";

export type DebtAmount =
  | "10 萬以下"
  | "10 - 50 萬"
  | "50 - 100 萬"
  | "100 - 300 萬"
  | "300 - 500 萬"
  | "500 - 1,000 萬"
  | "1,000 萬以上"
  | "不便透露";

export type Goal =
  | "建立緊急備用金"
  | "買房／換屋"
  | "子女教育金"
  | "提早退休／FIRE"
  | "安心退休（65歲後）"
  | "被動收入現金流"
  | "資產增值/打敗通膨"
  | "圓夢基金"
  | "其他";

export type Horizon =
  | "短期（1-3 年）"
  | "中期（3-10 年）"
  | "長期（10 年以上）"
  | "希望全面盤點";

export type Experience =
  | "定存/活存"
  | "股票"
  | "ETF/指數型"
  | "基金"
  | "保單/儲蓄險"
  | "不動產"
  | "加密貨幣"
  | "完全沒經驗";

export type Risk =
  | "保守型 (0-5%)"
  | "穩健型 (5-15%)"
  | "積極型 (15-30%)"
  | "進取型 (30%以上)"
  | "不確定，需要評估";

export type Protection =
  | "醫療險"
  | "壽險"
  | "意外險"
  | "重大疾病/癌症險"
  | "儲蓄/投資型保單"
  | "尚未規劃";

export type Premium =
  | "1 萬以下"
  | "1 - 3 萬"
  | "3 - 6 萬"
  | "6 - 10 萬"
  | "10 - 20 萬"
  | "20 萬以上";

export type AdvancedTopic =
  | "不了解自己狀況"
  | "保單健診"
  | "稅務規劃"
  | "資產傳承"
  | "海外配置"
  | "債務整合";

export type Plan =
  | "免費財務報告"
  | "30 分鐘諮詢"
  | "60 分鐘諮詢"
  | "一對一財務陪跑";

// 預約時段：改為 Google Calendar 預約 + 使用者回填已預約的時段（字串）
// 諮詢方式：統一現場面談，依「地區」分

export type LeadStatus = "new" | "contacted" | "closed" | "lost";

export interface FormPayload {
  // STEP 1
  name: string;
  email: string;
  contact_method: ContactMethod;
  contact_value: string;
  age_range: AgeRange;
  occupation: Occupation;
  family: Family;

  // STEP 2 — 數字以新台幣元為單位
  monthly_income: number;
  monthly_expense: number;
  monthly_saving: number;
  reserve_amount: number;
  asset_total: number;
  cash_liquid: number;
  debts: Debt[];
  debt_amount?: DebtAmount;

  // STEP 3
  goals: Goal[];
  goals_other?: string;
  horizon: Horizon;

  // STEP 4
  experience: Experience[];
  risk: Risk;
  protection: Protection[];
  premium?: Premium;
  advanced_topics: AdvancedTopic[];

  // STEP 5
  plans: Plan[];
  booked_slot: string;     // 使用者在 Google Calendar 預約後回填的日期時間
  district: string;        // 方便的地區（雙北為主）
  note?: string;
}

export interface Lead extends FormPayload {
  id: string;
  created_at: string;
  status: LeadStatus;
  notes: string;
  report_url: string | null;
}

export type AgeBucket = "young" | "mid" | "senior";
export type AssetBucket = "small" | "medium" | "large";
export type ExpBucket = "novice" | "intermediate" | "advanced";
export type RiskBucket = "conservative" | "balanced" | "aggressive";
export type CashflowHealth = "tight" | "ok" | "healthy";
export type ReserveHealth = "insufficient" | "adequate" | "abundant";
