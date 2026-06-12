import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "admin_session";

// 驗證 cookie 值（base64(user:pass)）
function isAuthed(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const decoded = atob(token);
    const idx = decoded.indexOf(":");
    if (idx < 0) return false;
    const u = decoded.slice(0, idx);
    const p = decoded.slice(idx + 1);
    return u === process.env.ADMIN_USER && p === process.env.ADMIN_PASS;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 把 pathname 注入 request header，layout 才能判斷是否為登入頁
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  const passthrough = () => NextResponse.next({ request: { headers: requestHeaders } });

  // 不需要登入的路徑：登入頁本身、登入 API
  if (path === "/admin/login" || path === "/api/admin/auth") {
    return passthrough();
  }

  // 後台頁面與 API
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (isAuthed(req)) return passthrough();

    // 頁面：導向登入頁
    if (path.startsWith("/admin")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    // API：回 401
    return new NextResponse("unauthorized", { status: 401 });
  }

  return passthrough();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
