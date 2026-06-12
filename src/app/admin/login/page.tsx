import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-ink mb-1">一針見血理財術 後台</h1>
          <p className="text-sm text-ink-muted">請登入以管理名單</p>
        </div>
        <LoginForm next={searchParams.next} error={searchParams.error} />
      </div>
    </main>
  );
}
