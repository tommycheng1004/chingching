import nodemailer from "nodemailer";

let _transport: nodemailer.Transporter | null = null;

function transport(): nodemailer.Transporter {
  if (_transport) return _transport;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD 尚未設定");
  _transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return _transport;
}

export async function sendReportEmail(opts: {
  to: string;
  name: string;
  pdf: Buffer;
  reportUrl: string;
}) {
  const from = process.env.GMAIL_FROM || process.env.GMAIL_USER!;
  await transport().sendMail({
    from: `"一針見血理財術｜晴晴護理師" <${from}>`,
    to: opts.to,
    subject: `${opts.name}，您的財務健檢報告已送達 📎`,
    html: htmlBody(opts.name, opts.reportUrl),
    attachments: [
      {
        filename: "financial-report.pdf",
        content: opts.pdf,
        contentType: "application/pdf",
      },
    ],
  });
}

function htmlBody(name: string, url: string) {
  return `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#3a2230">
    <h2 style="color:#9d174d;margin-bottom:8px">${name}，您的財務報告書已送達 📎</h2>
    <p>嗨 ${name}，感謝您填寫財務諮詢表單！</p>
    <p>我們依您的填答，已為您生成一份<b>個人化財務健檢報告</b>，請見本信附件 PDF。</p>
    <p>報告中包含：</p>
    <ul>
      <li>財務健全度評分（5 大面向）</li>
      <li>現金流與緊急備用金診斷</li>
      <li>建議資產配置與 10 年成長預測</li>
      <li>ABC 三大方案 30 年複利對比</li>
      <li>立即可執行的行動方案</li>
    </ul>
    <p>若 PDF 開啟有困難，也可以<a href="${url}" style="color:#db2777">點此連結</a>線上預覽。</p>
    <p>若您希望針對個人狀況做更細的規劃，歡迎預約諮詢。</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <p style="color:#6b7280;font-size:12px">一針見血理財術 ｜ 晴晴護理師 🌸</p>
  </div>`;
}
