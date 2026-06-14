import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { headers } from "next/headers";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 登入頁本身不顯示後台 nav
  const path = headers().get("x-pathname") || "";
  const isLogin = path.includes("/admin/login");
  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/admin" className="font-bold text-brand-dark">🌸 一針見血理財術 後台</Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:text-brand-dark">名單</Link>
          <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-brand-dark">儀表板</Link>
          <Link href="/admin/settings" className="text-sm text-gray-600 hover:text-brand-dark">設定</Link>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
