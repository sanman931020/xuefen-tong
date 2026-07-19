"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemePicker } from "@/components/ThemePicker";
import { THEME_OPTIONS, type ThemeId, isThemeId } from "@/lib/themes";

type Program = { id: string; code: string; name: string; type: string };

export function SettingsClient({
  displayName,
  entryYear,
  currentGrade,
  expectedGradYear,
  currentTerm,
  includeFailInAvg,
  themeColor,
  selectedCodes,
  programs,
}: {
  displayName: string;
  entryYear: number;
  currentGrade: number;
  expectedGradYear: number | null;
  currentTerm: string;
  includeFailInAvg: boolean;
  themeColor: string;
  selectedCodes: string[];
  programs: Program[];
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [year, setYear] = useState(entryYear);
  const [grade, setGrade] = useState(currentGrade);
  const [gradYear, setGradYear] = useState<string>(
    expectedGradYear != null ? String(expectedGradYear) : String(entryYear + 4)
  );
  const [term, setTerm] = useState(currentTerm);
  const [includeFail, setIncludeFail] = useState(includeFailInAvg);
  const [theme, setTheme] = useState<ThemeId>(isThemeId(themeColor) ? themeColor : "mint");
  const [codes, setCodes] = useState<string[]>(selectedCodes);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingPrograms, setSavingPrograms] = useState(false);

  // 伺服器資料更新時同步勾選狀態（避免重新進入仍顯示舊狀態）
  useEffect(() => {
    setCodes(selectedCodes);
  }, [selectedCodes]);

  async function persistPrograms(nextCodes: string[]) {
    setSavingPrograms(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programCodes: nextCodes }),
      });
      if (!res.ok) {
        setMessage("學制／學程儲存失敗，請再試一次");
        return false;
      }
      setMessage("學制／學程已自動儲存");
      router.refresh();
      return true;
    } catch {
      setMessage("學制／學程儲存失敗，請再試一次");
      return false;
    } finally {
      setSavingPrograms(false);
    }
  }

  async function toggle(code: string) {
    const next = codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code];
    setCodes(next);
    await persistPrograms(next);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: name,
        entryYear: year,
        currentGrade: grade,
        expectedGradYear: gradYear === "" ? null : Number(gradYear),
        currentTerm: term,
        includeFailInAvg: includeFail,
        themeColor: theme,
        programCodes: codes,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMessage("儲存失敗");
      return;
    }
    setMessage("已儲存");
    router.refresh();
  }

  const groups = [
    { title: "學制", items: programs.filter((p) => p.type === "undergraduate" || p.type === "master") },
    { title: "教育學程", items: programs.filter((p) => p.type === "education") },
  ];

  const themeLabel = THEME_OPTIONS.find((t) => t.id === theme)?.label;

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-5 p-6">
      <div>
        <label className="label">顯示名稱</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">入學學年</label>
          <input
            className="input"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={100}
            max={130}
          />
        </div>
        <div>
          <label className="label">現在年級</label>
          <select className="input" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <option key={g} value={g}>
                {g} 年級
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">預計畢業學年</label>
          <input
            className="input"
            type="number"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            min={100}
            max={140}
            placeholder="例如 117"
          />
        </div>
      </div>

      <div>
        <label className="label">目前學期</label>
        <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="114-2" />
      </div>

      <div>
        <div className="label">系統顏色{themeLabel ? `（目前：${themeLabel}）` : ""}</div>
        <ThemePicker value={theme} onChange={setTheme} persistRemote />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={includeFail} onChange={(e) => setIncludeFail(e.target.checked)} />
        平均計算含不及格成績
      </label>

      {groups.map((g) => (
        <div key={g.title}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="font-semibold text-[var(--brand-deep)]">{g.title}</div>
            {savingPrograms ? <span className="text-xs text-[var(--ink-muted)]">儲存中…</span> : null}
          </div>
          <p className="mb-2 text-xs text-[var(--ink-muted)]">勾選後會立即儲存，重新進入仍會保留。</p>
          <div className="space-y-2">
            {g.items.map((p) => (
              <label key={p.code} className="flex items-center gap-2 rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={codes.includes(p.code)}
                  onChange={() => void toggle(p.code)}
                  disabled={savingPrograms}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "儲存中…" : "儲存設定"}
      </button>
      {message ? <p className="text-sm text-[var(--brand)]">{message}</p> : null}
    </form>
  );
}
