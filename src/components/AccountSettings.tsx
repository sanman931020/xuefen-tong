"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountSettings({
  username: initialUsername,
  email,
  hasPassword: initialHasPassword,
  hasGoogle,
}: {
  username: string | null;
  email: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername ?? "");
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("兩次輸入的新密碼不一致");
      return;
    }

    const body: {
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};

    const trimmed = username.trim();
    if (trimmed && trimmed.toLowerCase() !== (initialUsername ?? "").toLowerCase()) {
      body.username = trimmed;
    } else if (!initialUsername && trimmed) {
      body.username = trimmed;
    }

    if (newPassword) {
      body.newPassword = newPassword;
      if (hasPassword) body.currentPassword = currentPassword;
    }

    if (!body.username && !body.newPassword) {
      setError("請填寫要變更的帳號或密碼");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "儲存失敗");
      return;
    }

    setHasPassword(Boolean(data.hasPassword));
    if (data.username) setUsername(data.username);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("帳號設定已更新。之後可用帳號密碼或 Google 登入，資料會是同一份。");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-deep)]">帳號與密碼</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          帳號、密碼皆至少 4 碼。設定後可在任何瀏覽器以帳號密碼登入；若已綁定 Google，用同一個
          Gmail 登入也會接到同一份資料。
        </p>
      </div>

      {email ? (
        <p className="text-sm text-[var(--ink-muted)]">
          綁定信箱：<span className="font-medium text-[var(--ink)]">{email}</span>
          {hasGoogle ? "（已連結 Google）" : null}
        </p>
      ) : hasGoogle ? (
        <p className="text-sm text-[var(--ink-muted)]">已連結 Google 帳號</p>
      ) : null}

      <div>
        <label className="label">登入帳號</label>
        <input
          className="input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={4}
          placeholder="至少 4 碼"
        />
      </div>

      {hasPassword ? (
        <div>
          <label className="label">目前密碼（變更密碼時必填）</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
      ) : (
        <p className="text-xs text-[var(--ink-muted)]">
          尚未設定密碼（例如用 Google 註冊）。設定帳號與新密碼後，即可用帳密登入。
        </p>
      )}

      <div>
        <label className="label">新密碼{hasPassword ? "（選填）" : ""}</label>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={4}
          placeholder="至少 4 碼"
        />
      </div>

      <div>
        <label className="label">確認新密碼</label>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={4}
        />
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "儲存中…" : "更新帳號／密碼"}
      </button>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--brand)]">{message}</p> : null}
    </form>
  );
}
