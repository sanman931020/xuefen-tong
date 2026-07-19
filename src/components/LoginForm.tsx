"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginFormInner({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app/schedule";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("帳號或密碼錯誤");
      return;
    }
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/app/schedule");
    router.refresh();
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-[var(--brand-deep)]">登入</h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        使用帳號與密碼登入。登入後會記住你的修課、規劃與成績資料。
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">帳號</label>
          <input
            className="input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={4}
          />
        </div>
        <div>
          <label className="label">密碼</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "登入中…" : "登入"}
        </button>
      </form>

      {googleEnabled ? (
        <button
          type="button"
          className="btn btn-ghost mt-3 w-full"
          onClick={() =>
            signIn("google", {
              callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : "/app/schedule",
            })
          }
        >
          使用 Gmail／Google 登入
        </button>
      ) : (
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          若要啟用 Gmail 登入，請在 <code>.env</code> 設定 <code>AUTH_GOOGLE_ID</code> 與{" "}
          <code>AUTH_GOOGLE_SECRET</code> 後重啟伺服器。
        </p>
      )}

      <p className="mt-6 text-sm text-[var(--ink-muted)]">
        還沒有帳號？{" "}
        <Link href="/register" className="font-semibold text-[var(--brand)]">
          註冊
        </Link>
      </p>
    </div>
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <Suspense fallback={<div className="card p-6 text-sm text-[var(--ink-muted)]">載入登入頁…</div>}>
      <LoginFormInner googleEnabled={googleEnabled} />
    </Suspense>
  );
}
