import { NextRequest, NextResponse } from "next/server";

const COOKIE = "admin_session";

/** 登入 */
export async function POST(req: NextRequest) {
  const { user, pass } = await req.json().catch(() => ({}));
  if (!user || !pass) {
    return NextResponse.json({ error: "請輸入帳號密碼" }, { status: 400 });
  }
  if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({ error: "帳號或密碼不正確" }, { status: 401 });
  }

  // base64(user:pass) — middleware 端解碼後驗證
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  });
  return res;
}

/** 登出 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
