"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  credits: number;
  programCode: string;
  groupCode: string | null;
};

type EnrollmentItem = {
  id: string;
  term: string;
  status: string;
  credits: number;
  score: number | null;
  label: string;
  code: string;
  categoryCode: string | null;
  programCode: string | null;
};

export function PlanClient({
  currentTerm,
  enrollments,
  courses,
}: {
  currentTerm: string;
  enrollments: EnrollmentItem[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [term, setTerm] = useState(suggestNextTerm(currentTerm));
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const terms = useMemo(() => {
    const set = new Set<string>(enrollments.map((e) => e.term));
    set.add(currentTerm);
    set.add(term);
    return Array.from(set).sort();
  }, [enrollments, currentTerm, term]);

  const byTerm = terms.map((t) => ({
    term: t,
    items: enrollments.filter((e) => e.term === t),
    credits: enrollments.filter((e) => e.term === t).reduce((s, e) => s + e.credits, 0),
  }));

  async function addPlanned() {
    if (!courseId) return;
    setLoading(true);
    setMessage("");
    const course = courses.find((c) => c.id === courseId);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        term,
        status: "planned",
        credits: course?.credits || 2,
        programCode: course?.programCode,
        categoryCode: course?.groupCode,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMessage("新增失敗");
      return;
    }
    setMessage("已加入規劃");
    router.refresh();
  }

  async function markTaken(id: string) {
    await fetch("/api/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "taken" }),
    });
    router.refresh();
  }

  async function removeItem(id: string) {
    await fetch(`/api/enrollments?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const plannedCredits = enrollments
    .filter((e) => e.status === "planned")
    .reduce((s, e) => s + e.credits, 0);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="text-sm text-[var(--ink-muted)]">計畫中學分合計</div>
        <div className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          {plannedCredits}
        </div>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          計畫課不會計入實際畢業進度，但會顯示在各分類的「規劃中」預估。
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-[var(--brand-deep)]">新增計畫科目</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">學期（例如 115-1）</label>
            <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">科目</label>
            <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{c.credits} 學分）
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={addPlanned} disabled={loading || !courseId}>
          {loading ? "加入中…" : "加入此學期規劃"}
        </button>
        {message ? <p className="text-sm text-[var(--brand)]">{message}</p> : null}
      </div>

      <div className="space-y-4">
        {byTerm.map((t) => (
          <div key={t.term} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[var(--brand-deep)]">{t.term}</h3>
              <span className="text-sm text-[var(--ink-muted)]">{t.credits} 學分</span>
            </div>
            {t.credits > 25 ? (
              <p className="mt-2 text-sm text-[var(--warn)]">此學期學分偏高，請注意負荷。</p>
            ) : null}
            <ul className="mt-4 space-y-2">
              {t.items.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{e.label}</span>
                    <span className="text-[var(--ink-muted)]">
                      {" "}
                      · {e.credits} 學分 · {statusLabel(e.status)}
                      {e.score != null ? ` · ${e.score} 分` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {e.status === "planned" ? (
                      <button type="button" className="btn btn-ghost !px-3 !py-1 text-xs" onClick={() => markTaken(e.id)}>
                        改為已修
                      </button>
                    ) : null}
                    <button type="button" className="btn btn-ghost !px-3 !py-1 text-xs" onClick={() => removeItem(e.id)}>
                      刪除
                    </button>
                  </div>
                </li>
              ))}
              {t.items.length === 0 ? (
                <li className="text-sm text-[var(--ink-muted)]">此學期尚無科目</li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    taken: "已修",
    in_progress: "修習中",
    planned: "計畫",
    failed: "不及格",
    transferred: "抵免",
  };
  return map[s] || s;
}

function suggestNextTerm(current: string) {
  const m = current.match(/^(\d+)-([12S])$/i);
  if (!m) return "115-1";
  const year = Number(m[1]);
  const sem = m[2].toUpperCase();
  if (sem === "1") return `${year}-2`;
  return `${year + 1}-1`;
}
