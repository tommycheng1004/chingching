# 一針見血理財術 ｜ 晴晴護理師 財務諮詢獲客系統

給財務顧問用的「填表 → 自動生成個人化財務報告 → 後台管理名單」全端網站。

## 📦 技術棧

| 用途 | 服務 |
|---|---|
| 前端 / API | Next.js 14 (App Router) + TailwindCSS |
| 資料庫 | **Firebase Firestore** |
| 檔案儲存（PDF）| **Firebase Cloud Storage** |
| PDF 生成 | @react-pdf/renderer |
| 後台圖表 | Recharts |
| 部署 | Netlify |

## 🚀 第一次設定

### 1. 安裝依賴
```powershell
npm install
```

### 2. 開兩個免費帳號

- **Firebase**：https://console.firebase.google.com → 建專案 + 啟用 Firestore + 啟用 Storage（升級 Blaze 方案，設預算上限 $1）
- **Netlify**：https://app.netlify.com → 用 GitHub 登入

### 3. Firebase 設定步驟

a. **建立專案**：Firebase Console → 新增專案（地區 `asia-east1`）
b. **啟用 Firestore**：以正式版啟動
c. **啟用 Storage**：同地區 `asia-east1`
d. **Firestore Rules** 設為全部拒絕：
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /{document=**} { allow read, write: if false; }
     }
   }
   ```
e. **Storage Rules** 允許讀、禁止寫：
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /reports/{file=**} { allow read; allow write: if false; }
     }
   }
   ```
f. **Service Account JSON**：Project Settings → Service accounts → Generate new private key → 下載

### 4. 建立 `.env.local`

複製 `.env.local.example` 為 `.env.local`，填：

```env
# 把整個 service account JSON 內容貼成單行（PowerShell 用 Get-Content 或工具壓平）
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...",...}

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx.firebasestorage.app

ADMIN_USER=admin
ADMIN_PASS=請改成只有顧問知道的密碼

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 顧問的 Google Calendar 預約連結
NEXT_PUBLIC_BOOKING_URL=https://calendar.app.google/xxxxxx
```

### 5. 本機開發

```powershell
npm run dev
```

- 表單頁：http://localhost:3000
- 後台：http://localhost:3000/admin

### 6. 部署到 Netlify

把 `.env.local` 內**全部變數**加到 Netlify Environment Variables（Site settings → Environment variables）。

**特別注意**：`FIREBASE_SERVICE_ACCOUNT_JSON` 因為含換行字元，要確保複製貼上後保持「單行 JSON」格式（在 Netlify UI 上貼整個 JSON 即可）。

## 🎨 客製化清單

### 改報告書文案
→ 編輯 [src/pdf/content.ts](src/pdf/content.ts)

### 改品牌色
→ 編輯 [tailwind.config.ts](tailwind.config.ts) 的 `brand` 顏色

### 改規則邏輯
→ [src/lib/rules.ts](src/lib/rules.ts)

### 改表單問題
→ [src/components/FormPage.tsx](src/components/FormPage.tsx)（同步更新 [src/types.ts](src/types.ts)）

### 換 Google Calendar 連結
→ 改 env 變數 `NEXT_PUBLIC_BOOKING_URL`

## 📁 重要檔案

```
src/
├── app/
│   ├── page.tsx                    填表頁
│   ├── report/[id]/page.tsx        報告下載頁
│   ├── admin/
│   │   ├── page.tsx                名單列表
│   │   ├── [id]/page.tsx           單筆詳情
│   │   └── dashboard/page.tsx      儀表板
│   └── api/
│       ├── submit/route.ts         核心：存資料 + 生 PDF
│       └── admin/[id]/route.ts     後台改/刪 API
├── components/FormPage.tsx
├── lib/
│   ├── firebase.ts                 Firestore + Storage admin client
│   └── rules.ts                    報告書規則引擎
├── pdf/
│   ├── Report.tsx                  PDF 模板
│   └── content.ts                  文案 + 品牌色
├── middleware.ts                   /admin Basic Auth
└── types.ts
```

## 💰 成本

- Firebase Spark / Blaze 免費額度：5GB 儲存 / 1GB 下載/天 / 50K Firestore 讀/天 — 本案幾乎不會超過
- Netlify Free：100GB 頻寬/月 + 商業使用免費
- 預期月支出：**$0**

⚠️ 升級到 Blaze 後**務必設預算上限**（Billing → Budgets & alerts → $1）防止程式碼意外爆量。
