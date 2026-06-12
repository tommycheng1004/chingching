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
