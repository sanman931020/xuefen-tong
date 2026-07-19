"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username: username.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "註冊失敗");
      return;
    }

    const login = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      setError("註冊成功，但自動登入失敗，請手動登入");
      router.push("/login");
      return;
    }
    router.push("/app/schedule");
    router.refresh();
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-[var(--brand-deep)]">註冊</h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        設定帳號與密碼（皆至少 4 碼），或使用 Gmail 註冊／登入。
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">姓名</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">帳號（至少 4 碼）</label>
          <input
            className="input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={4}
            placeholder="例如 student01"
          />
        </div>
        <div>
          <label className="label">密碼（至少 4 碼）</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "建立中…" : "建立帳號"}
        </button>
      </form>

      {googleEnabled ? (
        <button
          type="button"
          className="btn btn-ghost mt-3 w-full"
          onClick={() => signIn("google", { callbackUrl: "/app/schedule" })}
        >
          使用 Gmail／Google 註冊／登入
        </button>
      ) : (
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          若要啟用 Gmail，請在 <code>.env</code> 設定 <code>AUTH_GOOGLE_ID</code> 與{" "}
          <code>AUTH_GOOGLE_SECRET</code> 後重啟伺服器。
        </p>
      )}

      <p className="mt-6 text-sm text-[var(--ink-muted)]">
        已有帳號？{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          登入
        </Link>
      </p>
    </div>
  );
}
