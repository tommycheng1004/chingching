import {
  Document, Page, Text, View, StyleSheet, Svg, Path, G, Circle, Rect, Polygon, Line, Polyline, Font,
} from "@react-pdf/renderer";
import React from "react";
import { BRAND, SECTIONS, RISK_TABLE, INSURANCE_GAP, ABC_PLANS, INVEST_PRODUCTS, AllocationItem } from "./content";
import { ReportData } from "@/lib/rules";

Font.register({
  family: "NotoSansTC",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf" },
    { src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Bold.otf", fontWeight: "bold" },
  ],
});
// 讓 PDF 能顯示 emoji（@react-pdf 預設不畫 emoji，需指定圖片來源）
Font.registerEmojiSource({
  format: "png",
  url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/",
});
Font.registerHyphenationCallback((word) => {
  if (/[　-鿿＀-￯]/.test(word)) {
    const out: string[] = [];
    let buf = "";
    for (const ch of word) {
      if (/[　-鿿＀-￯]/.test(ch)) { if (buf) { out.push(buf); buf = ""; } out.push(ch); }
      else buf += ch;
    }
    if (buf) out.push(buf);
    return out;
  }
  return [word];
});

// ───────── Helpers ─────────
const safe = (n: any): number => (Number.isFinite(n) ? n : 0);
function fmtNT(n: number) {
  const v = safe(n);
  if (!v) return "0";
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)} 億`;
  if (v >= 10_000) return `${Math.round(v / 1000) / 10} 萬`;
  return v.toLocaleString("zh-TW");
}
function fmtW(n: number) {
  return Math.round(safe(n) / 10_000);
}

// ───────── Styles ─────────
const s = StyleSheet.create({
  page: { fontFamily: "NotoSansTC", fontSize: 10, color: BRAND.text, paddingTop: 8 },
  // Header bar — 正常流佈局
  topBar: { minHeight: 38, maxHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 40, color: BRAND.muted, fontSize: 9, borderBottomWidth: 1, borderBottomColor: BRAND.border, backgroundColor: "white" },
  topBrand: { color: BRAND.primary, fontWeight: "bold", letterSpacing: 1.5 },
  body: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 50, flex: 1 },
  // Notice banner (top of each section)
  notice: { flexDirection: "row", alignItems: "center", borderRadius: 6, marginBottom: 12, paddingVertical: 6, paddingHorizontal: 10 },
  noticeStripe: { width: 18, height: 14, marginRight: 8, borderRadius: 2 },
  noticeText: { fontSize: 9.5, flex: 1, lineHeight: 1.5 },
  // Section heading
  secNumLabel: { fontSize: 9, color: BRAND.muted, letterSpacing: 2, marginTop: 4 },
  secTitle: { fontSize: 22, fontWeight: "bold", color: BRAND.text, marginTop: 2, paddingBottom: 2 },
  secTitleBar: { width: 36, height: 3, backgroundColor: BRAND.primary, marginBottom: 8, marginTop: 6 },
  secDesc: { fontSize: 10, color: BRAND.muted, marginBottom: 14 },
  // Footer — 也用正常流（在 body 之後）
  footer: { paddingHorizontal: 40, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: BRAND.muted, borderTopWidth: 1, borderTopColor: BRAND.border, backgroundColor: "white" },
  // Cards & boxes
  kpi: { borderTopWidth: 3, borderRadius: 4, padding: 8, alignItems: "center", flex: 1, marginRight: 6 },
  kpiLabel: { fontSize: 9, color: BRAND.muted, marginBottom: 2 },
  kpiValue: { fontSize: 16, fontWeight: "bold", color: BRAND.text },
  kpiUnit: { fontSize: 8, color: BRAND.muted, marginTop: 1 },
  panel: { borderWidth: 1, borderColor: BRAND.border, borderRadius: 8, padding: 14 },
  // Helper sub-section header
  subHead: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 8 },
  subBar: { width: 3, height: 14, backgroundColor: BRAND.primary, marginRight: 6 },
  subHeadText: { fontSize: 12, fontWeight: "bold", color: BRAND.primary },
  // Table
  tableHead: { flexDirection: "row", backgroundColor: BRAND.light, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4 },
  tableHeadCell: { fontSize: 9, color: BRAND.muted, fontWeight: "bold" },
  tableRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableCell: { fontSize: 10, color: BRAND.text },
});

// ───────── Page Frame Helpers ─────────
function TopBar({ name }: { name: string }) {
  return (
    <View style={s.topBar}>
      <Text style={s.topBrand}>{BRAND.name}</Text>
      <Text>個人財務規劃報告書　／　{name}</Text>
    </View>
  );
}
function Footer({ page, total, name }: { page: number; total: number; name: string }) {
  return (
    <View style={s.footer}>
      <Text><Text style={{ color: BRAND.primary, fontWeight: "bold" }}>CONFIDENTIAL</Text>　·　{name} 限定</Text>
      <Text>{BRAND.advisor}　|　第 {String(page).padStart(2, "0")} 頁</Text>
    </View>
  );
}
function Notice({ type, text }: { type: "success" | "warn" | "danger" | "info"; text: string }) {
  const color =
    type === "success" ? BRAND.success :
    type === "warn" ? BRAND.warn :
    type === "danger" ? BRAND.danger : BRAND.accent;
  const bg =
    type === "success" ? "#ecfdf5" :
    type === "warn" ? "#fffbeb" :
    type === "danger" ? "#fef2f2" : "#ecfeff";
  return (
    <View style={{ flexDirection: "row", marginTop: 4, marginBottom: 12, backgroundColor: bg, borderRadius: 6, borderLeftWidth: 4, borderLeftColor: color, paddingVertical: 8, paddingLeft: 12, paddingRight: 12, minHeight: 28 }}>
      <Text style={{ fontSize: 9.5, lineHeight: 1.6, color: BRAND.text, flex: 1 }}>{text}</Text>
    </View>
  );
}
function SecHead({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <View>
      <Text style={s.secNumLabel}>SECTION {num}</Text>
      <Text style={s.secTitle}>{title}</Text>
      <View style={s.secTitleBar} />
      <Text style={s.secDesc}>{desc}</Text>
    </View>
  );
}
function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.subHead}>
      <View style={s.subBar} />
      <Text style={s.subHeadText}>{children}</Text>
    </View>
  );
}

// ───────── Chart components ─────────
function RingScore({ score, size = 110 }: { score: number; size?: number }) {
  const sc = safe(score);
  const radius = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, sc)) / 100) * circ;
  const color = sc >= 70 ? BRAND.success : sc >= 40 ? BRAND.warn : BRAND.danger;
  const status = sc >= 70 ? "優秀" : sc >= 40 ? "尚可" : "待加強";
  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={radius} stroke="#e5e7eb" strokeWidth={8} fill="none" />
      <Circle cx={cx} cy={cy} r={radius} stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={`${filled} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
      <Text x={cx} y={cy} style={{ fontSize: 22, fontWeight: "bold", fontFamily: "NotoSansTC" }} fill={BRAND.text} textAnchor="middle">{sc}</Text>
      <Text x={cx} y={cy + 12} style={{ fontSize: 9, fontFamily: "NotoSansTC" }} fill={color} textAnchor="middle">{status}</Text>
    </Svg>
  );
}

function DonutChart({ items, size = 110 }: { items: AllocationItem[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const inner = r * 0.55;
  let start = -Math.PI / 2;
  const total = items.reduce((a, b) => a + b.percent, 0) || 1;
  const arcs = items.map((it) => {
    const angle = (it.percent / total) * Math.PI * 2;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    start = end;
    return { d, color: it.color };
  });
  return (
    <Svg width={size} height={size}>
      {arcs.map((a, i) => <Path key={i} d={a.d} fill={a.color} />)}
      <Circle cx={cx} cy={cy} r={inner} fill="white" />
    </Svg>
  );
}

function RadarChart({ scores, size = 200 }: { scores: { label: string; score: number }[]; size?: number }) {
  // SVG 內預留更多 padding 給標籤
  const padding = 36;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - padding;
  const n = scores.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, ratio: number) => [cx + r * ratio * Math.cos(angle(i)), cy + r * ratio * Math.sin(angle(i))];
  const grid = [0.25, 0.5, 0.75, 1].map((ratio) =>
    scores.map((_, i) => point(i, ratio)).map(([x, y]) => `${x},${y}`).join(" ")
  );
  const data = scores.map((it, i) => point(i, safe(it.score) / 100).map((v) => Math.round(v * 10) / 10).join(",")).join(" ");
  return (
    <Svg width={size} height={size}>
      {grid.map((pts, i) => <Polygon key={i} points={pts} stroke="#cbd5e1" strokeWidth={0.5} fill="none" />)}
      {scores.map((_, i) => {
        const [x, y] = point(i, 1);
        return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />;
      })}
      <Polygon points={data} fill={BRAND.primary} fillOpacity={0.25} stroke={BRAND.primary} strokeWidth={1.5} />
      {scores.map((it, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <React.Fragment key={i}>
            <Text x={x} y={y - 1} style={{ fontSize: 7.5, fontFamily: "NotoSansTC" }} fill={BRAND.muted} textAnchor="middle">{it.label}</Text>
            <Text x={x} y={y + 9} style={{ fontSize: 9, fontWeight: "bold", fontFamily: "NotoSansTC" }} fill={BRAND.primary} textAnchor="middle">{it.score}</Text>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function LineChart({
  data, width = 440, height = 140, lines, yMax,
  yFmt = (v) => (v >= 10000 ? `${(v / 10000).toFixed(1)}億` : `${v}萬`),
}: {
  data: number[][];
  width?: number; height?: number;
  lines: { name: string; color: string }[];
  yMax?: number;
  yFmt?: (v: number) => string;
}) {
  // 全部清掉 NaN / Infinity
  const cleanData = data.map((series) => series.map((v) => (Number.isFinite(v) ? v : 0)));
  const padding = { top: 10, right: 10, bottom: 24, left: 48 };
  const W = width - padding.left - padding.right;
  const H = height - padding.top - padding.bottom;
  const flatMax = Math.max(1, ...cleanData.flat());
  const max = yMax && yMax > 0 ? yMax : flatMax * 1.1;
  const n = cleanData[0]?.length || 1;
  const x = (i: number) => padding.left + (n > 1 ? (i / (n - 1)) * W : W / 2);
  const y = (v: number) => padding.top + H - (max > 0 ? (v / max) * H : 0);

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max * i) / yTicks));
  const xLabels = Array.from({ length: n }, (_, i) => i);

  return (
    <Svg width={width} height={height}>
      {/* grid */}
      {yLabels.map((v, i) => (
        <React.Fragment key={i}>
          <Line x1={padding.left} y1={y(v)} x2={padding.left + W} y2={y(v)} stroke="#f1f5f9" strokeWidth={0.5} />
          <Text x={padding.left - 4} y={y(v) + 3} style={{ fontSize: 7, fontFamily: "NotoSansTC" }} fill={BRAND.muted} textAnchor="end">{yFmt(v)}</Text>
        </React.Fragment>
      ))}
      {/* x axis */}
      {xLabels.map((v, i) => (
        <Text key={i} x={x(i)} y={padding.top + H + 12} style={{ fontSize: 7, fontFamily: "NotoSansTC" }} fill={BRAND.muted} textAnchor="middle">{v}年</Text>
      ))}
      {/* lines */}
      {cleanData.map((series, idx) => {
        const points = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return <Polyline key={idx} points={points} fill="none" stroke={lines[idx].color} strokeWidth={2} />;
      })}
      {cleanData.map((series, idx) =>
        series.map((v, i) => (
          <Circle key={`${idx}-${i}`} cx={x(i)} cy={y(v)} r={2} fill={lines[idx].color} />
        ))
      )}
    </Svg>
  );
}

// ───────── Main Component ─────────
export function Report({ data }: { data: ReportData }) {
  const p = data.payload;
  const name = p.name;

  return (
    <Document>
      {/* P1 Cover */}
      <Page size="A4" style={{ fontFamily: "NotoSansTC" }}>
        <View style={{ flex: 1, backgroundColor: BRAND.light, padding: 40, color: BRAND.text, position: "relative" }}>
          {/* Verified badge */}
          <View style={{ position: "absolute", top: 36, right: 36, alignItems: "center" }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: BRAND.dark, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 28, color: BRAND.dark }}>✓</Text>
            </View>
            <Text style={{ fontSize: 7, color: BRAND.dark, marginTop: 4, letterSpacing: 1 }}>VERIFIED</Text>
            <Text style={{ fontSize: 7, color: BRAND.dark }}>{data.reportNo}</Text>
          </View>

          {/* Top label */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 50 }}>
            <View style={{ width: 3, height: 14, backgroundColor: BRAND.dark, marginRight: 8 }} />
            <Text style={{ fontSize: 11, letterSpacing: 3, color: BRAND.dark }}>{BRAND.nameEn}</Text>
          </View>

          {/* Big brand */}
          <Text style={{ fontSize: 56, fontWeight: "bold", marginTop: 12, color: BRAND.dark, letterSpacing: 2 }}>{BRAND.name}</Text>
          <Text style={{ fontSize: 14, letterSpacing: 8, color: BRAND.muted, marginTop: 4 }}>F · I · N · A · N · C · I · A · L</Text>

          {/* PFP report */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 28 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: BRAND.gold }} />
            <Text style={{ fontSize: 9, color: BRAND.dark, marginHorizontal: 10, letterSpacing: 2 }}>PFP REPORT v3.0</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: BRAND.gold }} />
          </View>

          <Text style={{ fontSize: 32, fontWeight: "bold", marginTop: 40, color: BRAND.text }}>個人財務規劃</Text>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: BRAND.text }}>分析報告書</Text>
          <Text style={{ fontSize: 11, color: BRAND.muted, marginTop: 8, letterSpacing: 3 }}>PERSONAL FINANCIAL PLANNING REPORT</Text>

          {/* Stats bar */}
          <View style={{ marginTop: 24, backgroundColor: BRAND.dark, borderRadius: 4, padding: 14, flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: BRAND.accent, letterSpacing: 1 }}>HEALTH</Text>
              <Text style={{ fontSize: 13, color: "white", fontWeight: "bold", marginTop: 2 }}>{data.overall}/100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: BRAND.accent, letterSpacing: 1 }}>RISK</Text>
              <Text style={{ fontSize: 11, color: "white", marginTop: 2 }}>{p.risk.split(" ")[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: BRAND.accent, letterSpacing: 1 }}>HORIZON</Text>
              <Text style={{ fontSize: 11, color: "white", marginTop: 2 }}>{p.horizon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: BRAND.accent, letterSpacing: 1 }}>RETURN</Text>
              <Text style={{ fontSize: 11, color: "white", marginTop: 2 }}>~5% / yr</Text>
            </View>
          </View>

          {/* Bottom info grid */}
          <View style={{ position: "absolute", bottom: 60, left: 40, right: 40 }}>
            <View style={{ height: 1, backgroundColor: BRAND.gold, marginBottom: 14 }} />
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, color: BRAND.dark, letterSpacing: 2 }}>▸ CLIENT</Text>
                <Text style={{ fontSize: 13, color: BRAND.text, fontWeight: "bold", marginTop: 4 }}>{name} 先生／女士</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, color: BRAND.dark, letterSpacing: 2 }}>▸ ISSUE DATE</Text>
                <Text style={{ fontSize: 13, color: BRAND.text, fontWeight: "bold", marginTop: 4 }}>{data.today}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, color: BRAND.dark, letterSpacing: 2 }}>▸ ADVISOR</Text>
                <Text style={{ fontSize: 13, color: BRAND.text, fontWeight: "bold", marginTop: 4 }}>{BRAND.advisor}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, color: BRAND.dark, letterSpacing: 2 }}>▸ PLAN</Text>
                <Text style={{ fontSize: 13, color: BRAND.text, fontWeight: "bold", marginTop: 4 }}>{p.plans[0]}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* P2 Contents */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Text style={s.secNumLabel}>CONTENTS</Text>
          <Text style={s.secTitle}>本份報告書目錄</Text>
          <View style={s.secTitleBar} />
          <Text style={s.secDesc}>一頁掌握 12 個主題，依序閱讀，循序漸進建立完整財務藍圖。</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {SECTIONS.map((sec, i) => (
              <View key={sec.num} style={{ width: "50%", padding: 4 }}>
                <View style={{ borderWidth: 1, borderColor: BRAND.border, borderRadius: 6, padding: 10, flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: BRAND.light, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: "bold", color: BRAND.primary }}>{sec.num}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text }}>{sec.title}</Text>
                    <Text style={{ fontSize: 8, color: BRAND.muted, marginTop: 1 }}>{sec.sub}</Text>
                  </View>
                  <Text style={{ fontSize: 9, color: BRAND.muted }}>P.{String(sec.page).padStart(2, "0")}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", backgroundColor: "#fffbeb", borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: 3, backgroundColor: BRAND.warn }} />
            <View style={{ flex: 1, padding: 10 }}>
              <Text style={{ fontSize: 9, color: BRAND.text, lineHeight: 1.6 }}>
                📖 閱讀建議　建議先翻到 P.03 健全度評分 看整體分數，再依序往後看。本報告書共 14 頁，每頁可獨立閱讀。
              </Text>
            </View>
          </View>
        </View>
        <Footer page={2} total={14} name={name} />
      </Page>

      {/* P3 Health Score */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type={data.overall >= 70 ? "success" : "warn"} text={`${data.overall >= 70 ? "✅" : "⚠️"} 財務健全度 ${data.overall} / 100，${data.overall >= 70 ? "體質良好，可進入資產加速期，重點轉向報酬優化與傳承規劃。" : "體質有改善空間，請依優先處理事項逐步補強。"}`} />
          <SecHead num="01" title="執行摘要與健全度評分" desc="五大面向綜合評分，數字一眼看懂目前的財務體質。" />

          <View style={[s.panel, { flexDirection: "row", alignItems: "center" }]}>
            <View style={{ marginRight: 18 }}>
              <RingScore score={data.overall} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: BRAND.muted, letterSpacing: 1 }}>FINANCIAL HEALTH SCORE</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: BRAND.text, marginTop: 4 }}>財務健全度綜合評分</Text>
              <Text style={{ fontSize: 11, color: BRAND.text, marginTop: 6 }}>
                總分 <Text style={{ fontWeight: "bold", color: BRAND.primary }}>{data.overall} / 100</Text> — {data.overall >= 70 ? "體質良好，可進入資產加速期。" : "建議優先處理待加強項目。"}
              </Text>
            </View>
          </View>

          <SubHead>五大面向細項評分</SubHead>
          <View style={{ flexDirection: "row" }}>
            {data.subScores.map((sub, i) => {
              const c = sub.score >= 70 ? BRAND.success : sub.score >= 40 ? BRAND.warn : BRAND.danger;
              return (
                <View key={sub.key} style={[s.kpi, { borderTopColor: c, borderWidth: 1, borderColor: BRAND.border, marginRight: i < data.subScores.length - 1 ? 6 : 0 }]}>
                  <Text style={s.kpiLabel}>{sub.label}</Text>
                  <Text style={[s.kpiValue, { color: c }]}>{sub.score}</Text>
                  <Text style={s.kpiUnit}>{sub.level}</Text>
                </View>
              );
            })}
          </View>

          <SubHead>最需要優先處理的事項</SubHead>
          <View style={s.panel}>
            {data.priorities.map((pr) => {
              const c = pr.score >= 70 ? BRAND.success : pr.score >= 40 ? BRAND.warn : BRAND.danger;
              return (
                <View key={pr.rank} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: pr.rank < 3 ? 1 : 0, borderBottomColor: "#f1f5f9" }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{pr.rank}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 11, color: BRAND.text }}>{pr.text}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: c }}>{pr.score}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <Footer page={3} total={14} name={name} />
      </Page>

      {/* P4 Personal Info */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type="success" text={`✅ 您處於 ${p.age_range} 階段，時間是最大的資產，越早啟動定期定額，複利效果越驚人（詳見 P.11）。`} />
          <SecHead num="02" title="個人資料總覽" desc="後續所有分析的基礎資料。" />

          <SubHead>基本資料</SubHead>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {[
              ["姓名", p.name],
              ["電子郵件", p.email],
              ["主要聯繫方式", `${p.contact_method}：${p.contact_value}`],
              ["年齡層", p.age_range],
              ["職業類別", p.occupation],
              ["家庭狀況", p.family],
            ].map(([k, v]) => (
              <View key={k} style={{ width: "50%", padding: 4 }}>
                <View style={{ borderWidth: 1, borderColor: BRAND.border, borderRadius: 6, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.primary }}>
                  <Text style={{ fontSize: 8, color: BRAND.muted }}>{k}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text, marginTop: 2 }}>{v}</Text>
                </View>
              </View>
            ))}
          </View>

          <SubHead>諮詢預約資訊</SubHead>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {[
              ["諮詢方案", p.plans.join("、")],
              ["預約時段", p.booked_slot],
              ["諮詢方式", "現場面談"],
              ["方便地區", p.district],
            ].map(([k, v]) => (
              <View key={k} style={{ width: "50%", padding: 4 }}>
                <View style={{ borderWidth: 1, borderColor: BRAND.border, borderRadius: 6, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.accent }}>
                  <Text style={{ fontSize: 8, color: BRAND.muted }}>{k}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text, marginTop: 2 }}>{v}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <Footer page={4} total={14} name={name} />
      </Page>

      {/* P5 Financial Status */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type={data.reserve.health === "insufficient" ? "danger" : "success"}
            text={data.reserve.health === "insufficient"
              ? `⚠️ 當前財務基礎需強化：緊急金僅 ${data.reserve.months} 個月（建議 3 個月）。建議優先處理後再加大投資金額。`
              : `✅ 財務基礎穩固：儲蓄率 ${data.cashflow.savingRatePct}%、緊急金 ${data.reserve.months} 個月，可進入加速期。`} />
          <SecHead num="03" title="財務現況分析" desc="收入、儲蓄率、資產、流動性備用金的全貌一頁看懂。" />

          <View style={{ flexDirection: "row" }}>
            {[
              { label: "月收入", value: fmtW(p.monthly_income), unit: `${p.monthly_income.toLocaleString()} 元`, color: BRAND.primary },
              { label: "儲蓄率", value: `${data.cashflow.savingRatePct}%`, unit: data.cashflow.health === "healthy" ? "良好" : data.cashflow.health === "ok" ? "尚可" : "待加強", color: data.cashflow.health === "tight" ? BRAND.warn : BRAND.primary },
              { label: "支出/收入比", value: `${Math.round((p.monthly_expense / Math.max(1, p.monthly_income)) * 100)}%`, unit: p.monthly_expense / p.monthly_income > 0.7 ? "過高" : "正常", color: p.monthly_expense / p.monthly_income > 0.7 ? BRAND.warn : BRAND.primary },
              { label: "資產規模", value: fmtW(p.asset_total), unit: `${p.asset_total.toLocaleString()} 元`, color: BRAND.primary },
              { label: "緊急預備倍數", value: `${data.reserve.months}`, unit: data.reserve.health === "abundant" ? "充足" : data.reserve.health === "adequate" ? "尚可" : "不足", color: data.reserve.health === "insufficient" ? BRAND.danger : BRAND.primary },
            ].map((it, i, arr) => (
              <View key={i} style={[s.kpi, { borderTopColor: it.color, borderWidth: 1, borderColor: BRAND.border, marginRight: i < arr.length - 1 ? 6 : 0 }]}>
                <Text style={s.kpiLabel}>{it.label}</Text>
                <Text style={[s.kpiValue, { color: it.color }]}>{it.value}</Text>
                <Text style={s.kpiUnit}>{it.unit}</Text>
              </View>
            ))}
          </View>

          <SubHead>每月收支結構</SubHead>
          <View style={{ flexDirection: "row" }}>
            {[
              { label: "INCOME · 月收入", value: fmtW(p.monthly_income), sub: `${p.monthly_income.toLocaleString()} 元`, color: BRAND.primary },
              { label: "EXPENSE · 月開銷", value: fmtW(p.monthly_expense), sub: `${p.monthly_expense.toLocaleString()} 元`, color: BRAND.warn },
              { label: "SAVING · 月儲蓄", value: fmtW(p.monthly_saving), sub: `儲蓄率 ${data.cashflow.savingRatePct}%`, color: BRAND.success },
            ].map((it, i) => (
              <View key={i} style={[s.kpi, { borderTopColor: it.color, borderWidth: 1, borderColor: BRAND.border, marginRight: i < 2 ? 6 : 0 }]}>
                <Text style={[s.kpiLabel, { color: it.color, fontWeight: "bold", fontSize: 8 }]}>{it.label}</Text>
                <Text style={[s.kpiValue, { color: it.color, fontSize: 20 }]}>{it.value}</Text>
                <Text style={s.kpiUnit}>{it.sub}</Text>
              </View>
            ))}
          </View>

          <SubHead>與業界建議標準比較</SubHead>
          <View style={s.panel}>
            {[
              { label: "儲蓄率", actual: data.cashflow.savingRatePct, target: 20, unit: "%", ok: data.cashflow.savingRatePct >= 20 },
              { label: "緊急備用", actual: data.reserve.months, target: 3, unit: " 個月", ok: data.reserve.months >= 3 },
              { label: "保險項數", actual: p.protection.filter((x) => x !== "尚未規劃").length, target: 4, unit: " 項", ok: p.protection.filter((x) => x !== "尚未規劃").length >= 4 },
              { label: "投資工具", actual: p.experience.filter((x) => x !== "完全沒經驗").length, target: 3, unit: " 種", ok: p.experience.filter((x) => x !== "完全沒經驗").length >= 3 },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ width: 60, fontSize: 10, color: BRAND.text }}>{row.label}</Text>
                <View style={{ flex: 1, height: 14, backgroundColor: "#f1f5f9", borderRadius: 7, marginRight: 8 }}>
                  <View style={{ width: `${Math.min(100, (row.actual / row.target) * 100)}%`, height: "100%", backgroundColor: row.ok ? BRAND.success : BRAND.warn, borderRadius: 7 }} />
                </View>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: row.ok ? BRAND.success : BRAND.warn, width: 60, textAlign: "right" }}>
                  {row.actual}{row.unit} {row.ok ? "✓" : "△"}
                </Text>
                <Text style={{ fontSize: 8, color: BRAND.muted, width: 70, textAlign: "right" }}>建議 ≥ {row.target}{row.unit}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <View style={[s.panel, { flex: 1, marginRight: 6, padding: 8 }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>負債項目</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text, marginTop: 2 }}>{p.debts.join("、")}</Text>
            </View>
            <View style={[s.panel, { flex: 1, padding: 8 }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>負債金額</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text, marginTop: 2 }}>{p.debt_amount || "未填寫"}</Text>
            </View>
          </View>
        </View>
        <Footer page={5} total={14} name={name} />
      </Page>

      {/* P6 Goals & Timeline */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type="success" text={`✅ 您已勾選 ${p.goals.length} 項財務目標，方向明確；建議從時間最近的目標開始拆解每月可量化的里程碑。`} />
          <SecHead num="04" title="財務目標與時程" desc="把你的目標放上時間軸，看清楚什麼時候要做什麼。" />

          <SubHead>目標時間軸</SubHead>
          <View style={[s.panel, { paddingVertical: 30 }]}>
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              {["短期", "中期", "長期"].map((label, i) => (
                <View key={label} style={{ flex: 1, alignItems: "center" }}>
                  <View style={{ width: "80%", height: 6, backgroundColor: i === 1 ? BRAND.primary : i === 0 ? BRAND.accent : "#cbd5e1", borderRadius: 3 }} />
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text, marginTop: 6 }}>{label}</Text>
                  <Text style={{ fontSize: 9, color: BRAND.muted, marginTop: 2 }}>
                    {i === 0 ? "1-3 年" : i === 1 ? "3-10 年" : "10+ 年"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <View style={[s.panel, { flex: 1, marginRight: 6, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.primary }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>您勾選的目標</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                {p.goals.map((g) => (
                  <View key={g} style={{ backgroundColor: BRAND.light, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 4, marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, color: BRAND.primary }}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[s.panel, { flex: 1, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.accent }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>關注時間軸</Text>
              <Text style={{ fontSize: 13, fontWeight: "bold", color: BRAND.text, marginTop: 4 }}>{p.horizon}</Text>
            </View>
          </View>

          <SubHead>時程對應策略</SubHead>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 1 }]}>時程</Text>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>對應目標</Text>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>建議方向</Text>
          </View>
          {[
            ["短期 1-3 年", "緊急備用、頭期款、近期支出", "高流動性、低波動"],
            ["中期 3-10 年", "買房、結婚、創業、學齡基金", "股債均衡，分散風險"],
            ["長期 10+ 年", "退休、財務獨立、傳承", "提高股票比重，享複利"],
          ].map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 1, fontWeight: "bold" }]}>{row[0]}</Text>
              <Text style={[s.tableCell, { flex: 2 }]}>{row[1]}</Text>
              <Text style={[s.tableCell, { flex: 2 }]}>{row[2]}</Text>
            </View>
          ))}

          <View style={{ marginTop: 10, flexDirection: "row", backgroundColor: "#ecfdf5", borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: 3, backgroundColor: BRAND.success }} />
            <View style={{ flex: 1, padding: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: BRAND.success, marginBottom: 2 }}>🎯 優先聚焦</Text>
              <Text style={{ fontSize: 10, color: BRAND.text }}>建議從 <Text style={{ fontWeight: "bold" }}>{p.goals[0]}</Text> 開始，拆成每月可量化的里程碑。</Text>
            </View>
          </View>
        </View>
        <Footer page={6} total={14} name={name} />
      </Page>

      {/* P7 Risk Profile + Radar */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type="success" text={`✅ 您已有 ${p.experience.filter((x) => x !== "完全沒經驗").length} 種投資經驗，具備基礎判斷力，建議進一步優化資產配置與再平衡紀律。`} />
          <SecHead num="05" title="風險屬性與多維評估" desc="投資經驗、風險屬性與五大面向強弱，一眼看完。" />

          <View style={[s.panel, { flexDirection: "row", alignItems: "center" }]}>
            <RadarChart scores={data.subScores.map((s) => ({ label: s.label, score: s.score }))} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <SubHead>您的投資經驗</SubHead>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {p.experience.map((e) => (
                  <View key={e} style={{ backgroundColor: BRAND.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginRight: 4, marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, color: BRAND.primary }}>{e}</Text>
                  </View>
                ))}
              </View>

              <SubHead>風險承受度</SubHead>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: BRAND.primary }}>{p.risk}</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={s.tableHead}>
              <Text style={[s.tableHeadCell, { flex: 1 }]}>風險屬性</Text>
              <Text style={[s.tableHeadCell, { flex: 1 }]}>可承受年度波動</Text>
              <Text style={[s.tableHeadCell, { flex: 1 }]}>預期年化報酬</Text>
              <Text style={[s.tableHeadCell, { flex: 1 }]}>適合配置</Text>
            </View>
            {RISK_TABLE.map((row, i) => {
              const isMe = data.riskBucket === "balanced" && row.type === "穩健型" ||
                data.riskBucket === "conservative" && row.type === "保守型" ||
                data.riskBucket === "aggressive" && (row.type === "積極型" || row.type === "進取型");
              return (
                <View key={i} style={[s.tableRow, isMe ? { backgroundColor: BRAND.light } : {}]}>
                  <Text style={[s.tableCell, { flex: 1, fontWeight: isMe ? "bold" : "normal", color: isMe ? BRAND.primary : BRAND.text }]}>{row.type}</Text>
                  <Text style={[s.tableCell, { flex: 1, fontWeight: isMe ? "bold" : "normal" }]}>{row.vol}</Text>
                  <Text style={[s.tableCell, { flex: 1, fontWeight: isMe ? "bold" : "normal" }]}>{row.ret}</Text>
                  <Text style={[s.tableCell, { flex: 1, fontWeight: isMe ? "bold" : "normal" }]}>{row.fit}</Text>
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", backgroundColor: BRAND.light, borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: 3, backgroundColor: BRAND.primary }} />
            <View style={{ flex: 1, padding: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: BRAND.primary, marginBottom: 4 }}>📊 結論</Text>
              <Text style={{ fontSize: 10, color: BRAND.text }}>
                您屬於 <Text style={{ fontWeight: "bold" }}>{p.risk.split(" ")[0]}</Text> 投資人。
                {data.riskBucket === "conservative" ? "保守為主，重防守。" : data.riskBucket === "balanced" ? "股債均衡，預期年化 4-6%。" : "成長為主，預期年化 6-10%。"}
              </Text>
            </View>
          </View>
        </View>
        <Footer page={7} total={14} name={name} />
      </Page>

      {/* P8 Insurance */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          {(() => {
            const covered = data.protectionGrid.filter((x) => x.have).length;
            return <Notice type={covered >= 5 ? "warn" : "danger"}
              text={`${covered >= 5 ? "⚠️" : "🚨"} 已配置 ${covered}/6 項，建議再補齊紅色標示的缺口（特別是長照險與癌症險）。`} />;
          })()}
          <SecHead num="06" title="保障規劃檢視" desc="六大核心保障（醫療／癌症／長照／壽險／重大疾病／意外）覆蓋情況。" />

          <SubHead>保障覆蓋矩陣</SubHead>
          <View style={[s.panel, { flexDirection: "row" }]}>
            {data.protectionGrid.map((item) => (
              <View key={item.name} style={{ flex: 1, alignItems: "center" }}>
                <View style={{ width: 36, height: 36, borderRadius: 4, backgroundColor: item.have ? "#ecfdf5" : "#fef2f2", borderWidth: 1, borderColor: item.have ? BRAND.success : BRAND.danger, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, color: item.have ? BRAND.success : BRAND.danger, fontWeight: "bold" }}>{item.have ? "✓" : "✗"}</Text>
                </View>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ fontSize: 8, color: item.have ? BRAND.success : BRAND.danger, marginTop: 2 }}>{item.have ? "已配置" : "建議補強"}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <View style={[s.panel, { flex: 1, marginRight: 6, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.primary }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>已配置保險</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                {p.protection.filter((x) => x !== "尚未規劃").map((x) => (
                  <View key={x} style={{ backgroundColor: BRAND.light, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 4, marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, color: BRAND.primary }}>{x}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[s.panel, { flex: 1, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.accent }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>每年保費支出</Text>
              <Text style={{ fontSize: 13, fontWeight: "bold", color: BRAND.text, marginTop: 4 }}>{p.premium || "未提供"}</Text>
              <Text style={{ fontSize: 8, color: BRAND.muted, marginTop: 2 }}>建議控制在年收入 10% 以內</Text>
            </View>
          </View>

          <SubHead>缺口分析</SubHead>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 1 }]}>類別</Text>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>建議標準</Text>
            <Text style={[s.tableHeadCell, { flex: 1 }]}>狀態</Text>
            <Text style={[s.tableHeadCell, { flex: 1 }]}>優先度</Text>
          </View>
          {INSURANCE_GAP.map((row, i) => {
            const item = data.protectionGrid.find((x) => x.name === row.type);
            const ok = item?.have || false;
            return (
              <View key={i} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 1, fontWeight: "bold" }]}>{row.type}</Text>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.std}</Text>
                <Text style={[s.tableCell, { flex: 1, color: ok ? BRAND.success : BRAND.danger, fontWeight: "bold" }]}>
                  {ok ? "✅ 已配置" : "⚠️ 強烈建議"}
                </Text>
                <Text style={[s.tableCell, { flex: 1, color: BRAND.warn }]}>{"★".repeat(row.pri)}</Text>
              </View>
            );
          })}
        </View>
        <Footer page={8} total={14} name={name} />
      </Page>

      {/* P9 Allocation + 10y Growth */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          {(() => {
            const g = data.growth10y[10];
            return <Notice type="success" text={`💎 10 年後依建議配置 vs 純定存，資產差距 + ${fmtW(g.recommended - g.baseline)} 萬元，這就是「不投資的代價」！`} />;
          })()}
          <SecHead num="07" title="建議資產配置與成長預測" desc="依您風險屬性 + 預期年化報酬試算 10 年複利成果。" />

          <View style={[s.panel, { flexDirection: "row", alignItems: "center" }]}>
            <DonutChart items={data.allocation.items} />
            <View style={{ flex: 1, marginLeft: 20 }}>
              {data.allocation.items.map((it, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <View style={{ width: 10, height: 10, backgroundColor: it.color, marginRight: 6, borderRadius: 2 }} />
                  <Text style={{ flex: 1, fontSize: 10 }}>{it.label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.primary }}>{it.percent}%</Text>
                </View>
              ))}
            </View>
          </View>

          <SubHead>10 年資產成長預測　單位：萬元</SubHead>
          <View style={[s.panel, { paddingHorizontal: 8 }]}>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                <View style={{ width: 12, height: 2, backgroundColor: BRAND.primary, marginRight: 4 }} />
                <Text style={{ fontSize: 8 }}>建議配置 (5%)</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 12, height: 2, backgroundColor: BRAND.muted, marginRight: 4 }} />
                <Text style={{ fontSize: 8 }}>純定存 (1%)</Text>
              </View>
            </View>
            <LineChart
              data={[
                data.growth10y.map((d) => fmtW(d.recommended)),
                data.growth10y.map((d) => fmtW(d.baseline)),
              ]}
              lines={[
                { name: "建議配置", color: BRAND.primary },
                { name: "純定存", color: BRAND.muted },
              ]}
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <View style={[s.kpi, { borderTopColor: BRAND.primary, borderWidth: 1, borderColor: BRAND.border }]}>
              <Text style={s.kpiLabel}>10 年後 · 建議配置</Text>
              <Text style={[s.kpiValue, { color: BRAND.primary }]}>{fmtW(data.growth10y[10].recommended)}</Text>
              <Text style={s.kpiUnit}>萬</Text>
            </View>
            <View style={[s.kpi, { borderTopColor: BRAND.muted, borderWidth: 1, borderColor: BRAND.border }]}>
              <Text style={s.kpiLabel}>10 年後 · 純定存</Text>
              <Text style={[s.kpiValue, { color: BRAND.muted }]}>{fmtW(data.growth10y[10].baseline)}</Text>
              <Text style={s.kpiUnit}>萬</Text>
            </View>
            <View style={[s.kpi, { borderTopColor: BRAND.success, backgroundColor: "#ecfdf5", marginRight: 0, borderWidth: 1, borderColor: BRAND.border }]}>
              <Text style={s.kpiLabel}>差距</Text>
              <Text style={[s.kpiValue, { color: BRAND.success }]}>+ {fmtW(data.growth10y[10].recommended - data.growth10y[10].baseline)}</Text>
              <Text style={s.kpiUnit}>萬</Text>
            </View>
          </View>
        </View>
        <Footer page={9} total={14} name={name} />
      </Page>

      {/* P10 Actual vs Recommended */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          {(() => {
            const cashRow = data.configDiff.find((x) => x.label === "現金／定存");
            const overconc = cashRow && cashRow.actual >= 70;
            return <Notice type={overconc ? "danger" : "info"}
              text={overconc
                ? `🚨 現金／活存 占整體資產 ${cashRow!.actual}%，已超過危險區間（70%）。本頁協助你看出該往哪裡分散。`
                : `本頁協助你看出實際 vs 建議的差距，紅／青色標示需要優先調整的方向。`} />;
          })()}
          <SecHead num="08" title="現況配置體檢｜實際 vs 建議" desc="把實際金額和建議比重並列，看出該往哪裡調整。" />

          <SubHead>大類資產配置 ─ 實際 vs 建議</SubHead>
          <View style={s.panel}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text style={{ width: 80, fontSize: 8, color: BRAND.muted }}></Text>
              <Text style={{ flex: 1, fontSize: 8, color: BRAND.primary, textAlign: "center" }}>● 你的實際</Text>
              <Text style={{ flex: 1, fontSize: 8, color: BRAND.muted, textAlign: "center" }}>● 建議比重</Text>
              <Text style={{ width: 50, fontSize: 8, color: BRAND.muted, textAlign: "right" }}>差距</Text>
            </View>
            {data.configDiff.map((row, i) => {
              const diffColor = Math.abs(row.diff) < 5 ? BRAND.success : row.diff > 0 ? BRAND.danger : BRAND.accent;
              return (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ width: 80, fontSize: 9, fontWeight: "bold" }}>{row.label}</Text>
                  <View style={{ flex: 1, marginRight: 4 }}>
                    <View style={{ height: 14, backgroundColor: "#f1f5f9", borderRadius: 3 }}>
                      <View style={{ width: `${row.actual}%`, height: "100%", backgroundColor: BRAND.primary, borderRadius: 3 }} />
                    </View>
                    <Text style={{ fontSize: 7, color: BRAND.primary, fontWeight: "bold", marginTop: 1 }}>{row.actual}%</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 4 }}>
                    <View style={{ height: 14, backgroundColor: "#f1f5f9", borderRadius: 3 }}>
                      <View style={{ width: `${row.suggested}%`, height: "100%", backgroundColor: BRAND.muted, borderRadius: 3 }} />
                    </View>
                    <Text style={{ fontSize: 7, color: BRAND.muted, fontWeight: "bold", marginTop: 1 }}>{row.suggested}%</Text>
                  </View>
                  <Text style={{ width: 50, fontSize: 10, fontWeight: "bold", color: diffColor, textAlign: "right" }}>
                    {row.diff > 0 ? "+" : ""}{row.diff}%
                  </Text>
                </View>
              );
            })}
            <Text style={{ fontSize: 8, color: BRAND.muted, marginTop: 4 }}>差距欄綠色＝接近建議、紅色＝過多需調降、青色＝不足需補足。</Text>
          </View>

          <SubHead>本次諮詢｜建議優先處理（顧問待辦）</SubHead>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {data.priorities.concat(data.priorities[0] ? [{ rank: 4, text: "建立分散投資組合，避免過度集中於單一資產類別", score: 50, tag: "進階" }] : []).slice(0, 4).map((pr, i) => (
              <View key={i} style={{ width: "50%", padding: 4 }}>
                <View style={[s.panel, { padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.primary }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", marginRight: 6 }}>
                      <Text style={{ fontSize: 9, color: "white", fontWeight: "bold" }}>{pr.rank}</Text>
                    </View>
                    <Text style={{ fontSize: 8, color: BRAND.warn, backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3 }}>{pr.tag}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: BRAND.text, lineHeight: 1.5 }}>{pr.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <Footer page={10} total={14} name={name} />
      </Page>

      {/* P11 ABC Plans */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type="success" text="⭐ 強烈推薦 B 平衡型　·　A 報酬太低、C 波動太大　·　金額單位：萬元" />
          <SecHead num="09" title="ABC 三大方案 · 30 年複利預測" desc="依風險偏好提供三套配置方案，30 年後的差距讓複利效果一目了然。" />

          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            {ABC_PLANS.map((plan) => (
              <View key={plan.key} style={{ flex: 1, marginRight: plan.key !== "C" ? 6 : 0, position: "relative" }}>
                {plan.fit && (
                  <View style={{ position: "absolute", top: -7, left: 0, right: 0, alignItems: "center", zIndex: 1 }}>
                    <View style={{ backgroundColor: BRAND.primary, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 8, color: "white", fontWeight: "bold" }}>★ 強烈推薦</Text>
                    </View>
                  </View>
                )}
                <View style={[s.panel, { padding: 10, borderWidth: 2, borderColor: plan.fit ? BRAND.primary : BRAND.border, marginTop: plan.fit ? 4 : 0 }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 24, fontWeight: "bold", color: plan.color }}>{plan.key}</Text>
                    {!plan.fit && <Text style={{ fontSize: 7, color: BRAND.danger, backgroundColor: "#fef2f2", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 }}>不推薦</Text>}
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "bold", marginTop: 2 }}>{plan.name}</Text>
                  <Text style={{ fontSize: 7, color: BRAND.muted, letterSpacing: 1 }}>RISK · {plan.risk}</Text>
                  <View style={{ backgroundColor: plan.fit ? BRAND.light : "#f8fafc", padding: 4, borderRadius: 3, marginTop: 4 }}>
                    <Text style={{ fontSize: 9, color: plan.color, fontWeight: "bold" }}>{plan.rate}</Text>
                  </View>
                  <Text style={{ fontSize: 8, color: BRAND.muted, marginTop: 4 }}>{plan.composition}</Text>
                  <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#f1f5f9" }}>
                    <Text style={{ fontSize: 8, fontWeight: "bold", color: plan.fit ? BRAND.success : BRAND.danger, marginBottom: 3 }}>
                      {plan.fit ? "✅ 適合您的原因" : "⚠️ 不適合您的原因"}
                    </Text>
                    {plan.reasons.map((r) => (
                      <Text key={r} style={{ fontSize: 7.5, color: BRAND.text, marginBottom: 1, lineHeight: 1.4 }}>· {r}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>

          <SubHead>30 年複利預測（依您每月可儲蓄 NT$ {p.monthly_saving.toLocaleString()}）　單位：萬元</SubHead>
          <View style={[s.panel, { paddingHorizontal: 8 }]}>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              {ABC_PLANS.map((pl) => (
                <View key={pl.key} style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                  <View style={{ width: 12, height: 2, backgroundColor: pl.color, marginRight: 4 }} />
                  <Text style={{ fontSize: 8 }}>{pl.key} {pl.name}</Text>
                </View>
              ))}
            </View>
            <LineChart
              data={[
                data.abc.map((d) => fmtW(d.A)),
                data.abc.map((d) => fmtW(d.B)),
                data.abc.map((d) => fmtW(d.C)),
              ]}
              lines={[
                { name: "A", color: ABC_PLANS[0].color },
                { name: "B", color: ABC_PLANS[1].color },
                { name: "C", color: ABC_PLANS[2].color },
              ]}
            />
          </View>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            {ABC_PLANS.map((plan, i) => {
              const final = data.abc[data.abc.length - 1];
              const value = (final as any)[plan.key];
              return (
                <View key={plan.key} style={[s.kpi, {
                  borderTopColor: plan.color, borderWidth: plan.fit ? 2 : 1, borderColor: plan.fit ? plan.color : BRAND.border,
                  marginRight: i < 2 ? 6 : 0, backgroundColor: plan.fit ? BRAND.light : "white",
                }]}>
                  <Text style={s.kpiLabel}>30 年 · {plan.key}{plan.fit ? " ★" : ""}</Text>
                  <Text style={[s.kpiValue, { color: plan.color }]}>{fmtW(value)}</Text>
                  <Text style={[s.kpiUnit, { color: plan.fit ? BRAND.success : BRAND.danger, fontWeight: "bold" }]}>
                    {plan.fit ? "推薦" : "不推薦"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <Footer page={11} total={14} name={name} />
      </Page>

      {/* P12 Investment Targets */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type="success" text={`🎯 以下標的皆為顧問長期追蹤過的工具，建議從 2-3 檔開始定期定額，避免一次買太多分散精力。`} />
          <SecHead num="10" title="具體標的與進場策略" desc="給你可立刻執行的工具清單與進場節奏建議。" />

          <SubHead>推薦投資標的（依類別）</SubHead>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 1 }]}>類別</Text>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>代表標的</Text>
            <Text style={[s.tableHeadCell, { flex: 1.4 }]}>特色</Text>
          </View>
          {INVEST_PRODUCTS.map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 1, fontWeight: "bold" }]}>{row.cat}</Text>
              <Text style={[s.tableCell, { flex: 2 }]}>{row.items}</Text>
              <Text style={[s.tableCell, { flex: 1.4, color: BRAND.muted }]}>{row.feat}</Text>
            </View>
          ))}

          <SubHead>進場策略</SubHead>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginRight: 6, flexDirection: "row", borderWidth: 1, borderColor: BRAND.border, borderRadius: 8, overflow: "hidden" }}>
              <View style={{ width: 3, backgroundColor: BRAND.gold }} />
              <View style={{ flex: 1, padding: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: BRAND.gold, marginBottom: 4 }}>💰 一筆資金（Lump Sum）</Text>
                <Text style={{ fontSize: 9, color: BRAND.text, marginBottom: 2 }}>分 6-12 個月平均投入，50% 立即 + 50% 分批</Text>
                <Text style={{ fontSize: 9, color: BRAND.muted }}>適合：大盤相對低點、有判斷力者</Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: BRAND.border, borderRadius: 8, overflow: "hidden" }}>
              <View style={{ width: 3, backgroundColor: BRAND.accent }} />
              <View style={{ flex: 1, padding: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: BRAND.accent, marginBottom: 4 }}>📅 定期定額（DCA）</Text>
                <Text style={{ fontSize: 9, color: BRAND.text, marginBottom: 2 }}>每月投入可儲蓄的 50-70%，2-3 檔分散</Text>
                <Text style={{ fontSize: 9, color: BRAND.muted }}>適合：新手、忙碌族、養成紀律</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", backgroundColor: BRAND.light, borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: 3, backgroundColor: BRAND.primary }} />
            <View style={{ flex: 1, padding: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: BRAND.primary, marginBottom: 4 }}>💡 個人化建議</Text>
            <Text style={{ fontSize: 10, color: BRAND.text, lineHeight: 1.5 }}>
              每月可儲蓄 NT$ {p.monthly_saving.toLocaleString()}，建議 60%（{Math.round(p.monthly_saving * 0.6).toLocaleString()}）定期定額，40%（{Math.round(p.monthly_saving * 0.4).toLocaleString()}）彈性加碼。推薦 <Text style={{ fontWeight: "bold" }}>B 平衡型</Text>。
            </Text>
            </View>
          </View>
        </View>
        <Footer page={12} total={14} name={name} />
      </Page>

      {/* P13 Key Insights & Actions */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          {(() => {
            const reds = data.subScores.filter((s) => s.score < 40).length;
            return <Notice type={reds > 0 ? "danger" : "success"}
              text={reds > 0 ? `⚠️ 共 ${reds} 項紅燈警示，本頁列出具體行動方案，建議與顧問逐項討論優先順序。` : "✅ 整體體質健康，本頁列出可優化方向。"} />;
          })()}
          <SecHead num="11" title="重點分析與行動方案" desc="最值得關注的觀察，搭配短中長期具體行動。" />

          <SubHead>重點分析</SubHead>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {data.subScores.map((sub) => {
              const c = sub.score >= 70 ? BRAND.success : sub.score >= 40 ? BRAND.warn : BRAND.danger;
              const icon = sub.key === "saving" ? "💰" : sub.key === "reserve" ? "🏦" : sub.key === "debt" ? "💳" : sub.key === "protection" ? "🔒" : "📈";
              const desc =
                sub.key === "saving" ? `儲蓄率 ${data.cashflow.savingRatePct}%，目標推進至 20% 以上。` :
                sub.key === "reserve" ? `目前 ${data.reserve.months} 個月，先補到 3 個月。` :
                sub.key === "debt" ? (p.debts.includes("無負債") ? "無負債，財務基礎健康。" : "建議優先清償高利率部分。") :
                sub.key === "protection" ? `已配置 ${p.protection.filter((x) => x !== "尚未規劃").length} 項保險。` :
                `已接觸 ${p.experience.filter((x) => x !== "完全沒經驗").length} 種工具，可建立分散組合。`;
              return (
                <View key={sub.key} style={{ width: "33.33%", padding: 3 }}>
                  <View style={[s.panel, { padding: 10, borderTopWidth: 3, borderTopColor: c }]}>
                    <Text style={{ fontSize: 14, marginBottom: 2 }}>{icon}</Text>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text }}>{sub.label}</Text>
                    <Text style={{ fontSize: 9, color: BRAND.muted, marginTop: 2, lineHeight: 1.5 }}>{desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <SubHead>分階段行動方案</SubHead>
          <View style={s.panel}>
            {[
              { num: 1, title: "建立緊急備用金", tag: "短期 1-3 年", desc: "於高流動性帳戶（數位活存）累積 3 個月生活支出，作為任何規劃的安全墊。", color: BRAND.accent },
              { num: 2, title: "補強實支實付醫療險", tag: "短期 1-3 年", desc: "彌補健保不足的醫療雜費風險，年保費控制在年收 3% 內為原則。", color: BRAND.accent },
              { num: 3, title: "啟動定期定額投資計畫", tag: "中期 3-10 年", desc: "依風險屬性建立分散組合，從每月可儲蓄金額的 50-70% 開始投入。", color: BRAND.primary },
              { num: 4, title: "建立退休／財務獨立部位", tag: "長期 10 年以上", desc: "以全球分散的指數型 ETF 為核心，享受長期複利，每年檢視一次。", color: BRAND.dark },
            ].map((row) => (
              <View key={row.num} style={{ flexDirection: "row", paddingVertical: 7, borderBottomWidth: row.num < 4 ? 1 : 0, borderBottomColor: "#f1f5f9", alignItems: "flex-start" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: row.color, alignItems: "center", justifyContent: "center", marginRight: 8, marginTop: 1 }}>
                  <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{row.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 11, fontWeight: "bold", color: BRAND.text, flex: 1 }}>{row.title}</Text>
                    <Text style={{ fontSize: 8, color: BRAND.primary, backgroundColor: BRAND.light, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3 }}>{row.tag}</Text>
                  </View>
                  <Text style={{ fontSize: 9, color: BRAND.muted, marginTop: 2, lineHeight: 1.5 }}>{row.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {p.advanced_topics.length > 0 && (
            <>
              <SubHead>進階規劃議題（待諮詢中展開）</SubHead>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {p.advanced_topics.map((t) => (
                  <View key={t} style={{ backgroundColor: BRAND.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginRight: 4, marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, color: BRAND.primary }}>{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
        <Footer page={13} total={14} name={name} />
      </Page>

      {/* P14 Closing */}
      <Page size="A4" style={s.page}>
        <TopBar name={name} />
        <View style={s.body}>
          <Notice type="success" text="🎓 報告書到此結束。看完不執行＝沒看，建議於本週與顧問約一次諮詢，把上述行動方案拆成可量化的「每月任務」。" />
          <SecHead num="12" title="結語與後續服務" desc="執行才是關鍵。建議的後續節奏與聯繫方式如下。" />

          <View style={{ backgroundColor: BRAND.navy, padding: 16, borderRadius: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: BRAND.accent, marginBottom: 8 }}>📅 建議的後續節奏</Text>
            <Text style={{ fontSize: 10, color: "white", marginBottom: 4 }}>· 每月 — 紀錄收支、檢視儲蓄目標達成率</Text>
            <Text style={{ fontSize: 10, color: "white", marginBottom: 4 }}>· 每季 — 檢視投資組合績效，必要時再平衡</Text>
            <Text style={{ fontSize: 10, color: "white" }}>· 每年 — 全面複盤財務體檢，更新目標與配置</Text>
          </View>

          <SubHead>本次諮詢服務內容</SubHead>
          <View style={{ flexDirection: "row" }}>
            <View style={[s.panel, { flex: 1, marginRight: 6, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.primary }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>方案</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginTop: 4 }}>{p.plans.join("、")}</Text>
            </View>
            <View style={[s.panel, { flex: 1, padding: 10, borderLeftWidth: 3, borderLeftColor: BRAND.accent }]}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>提供方</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginTop: 4 }}>{BRAND.advisor}</Text>
            </View>
          </View>

          <View style={{ marginTop: 16, backgroundColor: BRAND.navy, padding: 16, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 8, color: BRAND.accent, letterSpacing: 2 }}>REPORT BY</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "white", marginTop: 4 }}>{BRAND.advisor}</Text>
              <Text style={{ fontSize: 8, color: BRAND.accent, marginTop: 2, letterSpacing: 1 }}>{BRAND.nameEn}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 8, color: BRAND.accent, letterSpacing: 2 }}>REPORT NO.</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "white", marginTop: 4 }}>{data.reportNo}</Text>
            </View>
          </View>

          <View style={{ marginTop: 14, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6, borderWidth: 1, borderColor: BRAND.border }}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: BRAND.text, marginBottom: 4 }}>免責聲明</Text>
            <Text style={{ fontSize: 8, color: BRAND.muted, lineHeight: 1.6 }}>
              本報告書僅作為個人財務規劃之參考，內容係依據客戶提供之資料整理而成，不構成任何形式的投資建議或商品推介。
              所有投資皆有風險，過去績效不代表未來表現。執行前請審慎評估自身狀況，必要時諮詢專業意見。本報告書屬機密文件，未經本人授權不得對外揭露。
            </Text>
          </View>
        </View>
        <Footer page={14} total={14} name={name} />
      </Page>
    </Document>
  );
}
