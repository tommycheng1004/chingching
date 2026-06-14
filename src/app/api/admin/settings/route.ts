import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveSiteSettings } from "@/lib/firebase";

// 注意：middleware 已驗證 cookie session，這裡不必再驗一次

export async function POST(req: NextRequest) {
  const body = await req.json();
  const booking_url = String(body.booking_url || "").trim();
  try {
    await saveSiteSettings({ booking_url });
    revalidatePath("/");                // 前台表單
    revalidatePath("/admin/settings");  // 後台設定頁
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
