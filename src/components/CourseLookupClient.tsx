"use client";

import { useEffect, useState } from "react";

type LookupItem = {
  id: string;
  code: string;
  name: string;
  credits: number;
  notes: string | null;
  path: string;
  programCode: string;
  programName: string;
  groupCode: string | null;
  groupName: string | null;
};

type EnrollStatus = "in_progress" | "planned" | "taken";

const STATUS_OPTIONS: { value: EnrollStatus; label: string }[] = [
  { value: "in_progress", label: "正在修" },
  { value: "planned", label: "預計修" },
  { value: "taken", label: "已修畢" },
];

export function CourseLookupClient({ currentTerm }: { currentTerm: string }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LookupItem[]>([]);
  const [searched, setSearched] = useState(false);

  const [selected, setSelected] = useState<LookupItem | null>(null);
  const [status, setStatus] = useState<EnrollStatus>("in_progress");
  const [term, setTerm] = useState(currentTerm);
  const [score, setScore] = useState("");
  const [credits, setCredits] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setSearched(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/courses/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setItems(data.items || []);
      setSearched(true);
      setLoading(false);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || submitting) return;
      setSelected(null);
      setMessage("");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, submitting]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  function openEnroll(item: LookupItem) {
    setSelected(item);
    setStatus("in_progress");
    setTerm(currentTerm);
    setScore("");
    setCredits(item.credits);
    setMessage("");
  }

  function closeEnroll() {
    if (submitting) return;
    setSelected(null);
    setMessage("");
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || submitting) return;

    const termValue = term.trim();
    if (termValue.length < 3) {
      setMessage("請填寫學期，例如 114-2");
      return;
    }

    const scoreNum = score === "" ? null : Number(score);
    if (score !== "" && (Number.isNaN(scoreNum!) || scoreNum! < 0 || scoreNum! > 100)) {
      setMessage("分數須為 0–100");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selected.id,
          customName: selected.name,
          customCode: selected.code,
          credits: Number(credits),
          term: termValue,
          status,
          score: status === "planned" ? null : scoreNum,
          programCode: selected.programCode,
          categoryCode: selected.groupCode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "加入失敗");
        return;
      }
      setSelected(null);
      setMessage("");
      setToast(`已將「${selected.name}」加入修課紀錄`);
    } catch {
      setMessage("加入失敗，請再試一次");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[var(--brand-deep)] px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
      <div className="card p-5">
        <label className="label">輸入課程名稱</label>
        <input
          className="input"
          placeholder="例如：教育概論、軟體工程、幼兒發展"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          查詢結果會顯示所屬類別路徑，例如：教育學程 - 小教 - 教育專業課程 - 教育基礎課程
        </p>
      </div>

      {loading ? <p className="text-sm text-[var(--ink-muted)]">搜尋中…</p> : null}

      {!loading && searched && items.length === 0 ? (
        <div className="card p-5 text-sm text-[var(--ink-muted)]">找不到符合的課程，可換關鍵字再試。</div>
      ) : null}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-[var(--brand-deep)]">{item.name}</div>
                <div className="mt-1 text-sm text-[var(--ink-muted)]">
                  {item.credits} 學分
                  {item.notes ? ` · ${item.notes}` : ""}
                </div>
              </div>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-deep)]">
                {item.programName}
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-[var(--bg-accent)] px-4 py-3">
              <div className="text-xs tracking-wide text-[var(--ink-muted)]">所屬類別</div>
              <div className="mt-1 font-medium leading-relaxed">{item.path}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="btn btn-primary !px-4 !py-2 text-sm" onClick={() => openEnroll(item)}>
                加入修課紀錄
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-dialog-title"
          onClick={closeEnroll}
        >
          <form
            className="card w-full max-w-md space-y-4 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={confirmEnroll}
          >
            <div>
              <h2 id="enroll-dialog-title" className="text-lg font-bold text-[var(--brand-deep)]">
                確認加入修課紀錄？
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {selected.name} · {selected.credits} 學分
              </p>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{selected.path}</p>
            </div>

            <fieldset>
              <legend className="label">修課狀態</legend>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${
                      status === opt.value
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold text-[var(--brand-deep)]"
                        : "border-[var(--line)] bg-white text-[var(--ink)]"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name="enroll-status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={() => setStatus(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="enroll-term">
                  學期
                </label>
                <input
                  id="enroll-term"
                  className="input"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="114-2"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="enroll-credits">
                  學分
                </label>
                <input
                  id="enroll-credits"
                  className="input"
                  type="number"
                  min={0}
                  step={0.5}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                />
              </div>
            </div>

            {status !== "planned" ? (
              <div>
                <label className="label" htmlFor="enroll-score">
                  分數{status === "in_progress" ? "（可留空）" : "（可留空，成績未到）"}
                </label>
                <input
                  id="enroll-score"
                  className="input"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="例如 85"
                />
              </div>
            ) : null}

            {message ? <p className="text-sm text-[var(--danger)]">{message}</p> : null}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button type="button" className="btn btn-ghost" onClick={closeEnroll} disabled={submitting}>
                取消
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "加入中…" : "確認加入"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
