import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let app: App | null = null;

function getApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
  const serviceAccount = JSON.parse(raw);
  app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

export function firestore(): Firestore {
  return getFirestore(getApp());
}

export function bucket() {
  return getStorage(getApp()).bucket();
}

export const LEADS = "leads";

/** Firestore Timestamp → ISO string for safe serialization to client components */
export function tsToIso(v: any): string {
  if (!v) return "";
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v?.toDate) return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** Build a stable public URL for a file in our reports bucket (Storage rules allow public read) */
export function publicFileUrl(path: string): string {
  const b = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
  return `https://firebasestorage.googleapis.com/v0/b/${b}/o/${encodeURIComponent(path)}?alt=media`;
}

// ───────── 顧問可在後台自行調整的站台設定 ─────────
export const SETTINGS = "settings";
export const SITE_DOC = "site";

export interface SiteSettings {
  booking_url: string;
}

const DEFAULT_BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendar.app.google/example";

/** 讀站台設定；Firestore 尚未啟用或讀取失敗時，退回環境變數預設值（不會壞） */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await firestore().collection(SETTINGS).doc(SITE_DOC).get();
    const data = (snap.exists ? snap.data() : {}) as Partial<SiteSettings>;
    return { booking_url: data.booking_url || DEFAULT_BOOKING_URL };
  } catch {
    return { booking_url: DEFAULT_BOOKING_URL };
  }
}

/** 後台儲存設定（只更新有傳入的欄位） */
export async function saveSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
  await firestore().collection(SETTINGS).doc(SITE_DOC).set(patch, { merge: true });
}
