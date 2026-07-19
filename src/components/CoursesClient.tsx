"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  credits: number;
  programCode: string;
  programLabel: string;
  groupCode: string | null;
  groupName: string | null;
};

type GroupOption = {
  programCode: string;
  code: string;
  name: string;
  blockName: string | null;
};

const STATUS_OPTIONS = [
  { value: "taken", label: "已修" },
  { value: "in_progress", label: "修習中" },
  { value: "planned", label: "計畫" },
  { value: "failed", label: "不及格" },
  { value: "transferred", label: "抵免" },
];

export function CoursesClient({
  currentTerm,
  courses,
  groups: allGroups,
  enrollments,
}: {
  currentTerm: string;
  courses: CourseOption[];
  groups: GroupOption[];
  enrollments: {
    id: string;
    label: string;
    term: string;
    status: string;
    credits: number;
    score: number | null;
    categoryName: string | null;
  }[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");

  const programs = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of allGroups) {
      const fromCourse = courses.find((c) => c.programCode === g.programCode);
      map.set(g.programCode, fromCourse?.programLabel || g.programCode);
    }
    for (const c of courses) map.set(c.programCode, c.programLabel);
    return [...map.entries()].map(([code, label]) => ({ code, label }));
  }, [courses, allGroups]);

  const [programCode, setProgramCode] = useState(programs[0]?.code || "UNDERGRAD");

  const groups = useMemo(() => {
    const list = allGroups.filter((g) => g.programCode === programCode);
    if (list.length > 0) return list.map((g) => ({ code: g.code, name: g.name, blockName: g.blockName }));
    // fallback：從科目推類別
    const map = new Map<string, string>();
    for (const c of courses) {
      if (c.programCode !== programCode || !c.groupCode) continue;
      map.set(c.groupCode, c.groupName || c.groupCode);
    }
    return [...map.entries()].map(([code, name]) => ({ code, name, blockName: null as string | null }));
  }, [allGroups, courses, programCode]);

  const [groupCode, setGroupCode] = useState(groups[0]?.code || "");
  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (c) => c.programCode === programCode && (groupCode ? c.groupCode === groupCode : true)
      ),
    [courses, programCode, groupCode]
  );

  const [courseId, setCourseId] = useState(filteredCourses[0]?.id || "");
  const [customName, setCustomName] = useState(filteredCourses[0]?.name || "");
  const [customCode, setCustomCode] = useState(filteredCourses[0]?.code || "");
  const [credits, setCredits] = useState(filteredCourses[0]?.credits ?? 2);
  const [term, setTerm] = useState(currentTerm);
  const [status, setStatus] = useState("taken");
  const [score, setScore] = useState<string>("");
  const [categoryCode, setCategoryCode] = useState(groups[0]?.code || "FREE");
  const [manualProgramCode, setManualProgramCode] = useState(programCode);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedGroup = groups.find((g) => g.code === (mode === "catalog" ? groupCode : categoryCode));
  const isGeClassify = Boolean(selectedGroup?.name.includes("分類選修"));
  const isGePe = selectedGroup?.code === "GE_PE";
  const isGeCommonElective = selectedGroup?.code === "GE_ELECTIVE";

  const groupsByBlock = useMemo(() => {
    const map = new Map<string, typeof groups>();
    for (const g of groups) {
      const key = g.blockName || "其他";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    }
    return [...map.entries()];
  }, [groups]);

  function applyCourseDefaults(id: string) {
    const c = courses.find((x) => x.id === id);
    if (!c) return;
    setCourseId(id);
    setCredits(c.credits);
    setCategoryCode(c.groupCode || "");
    setManualProgramCode(c.programCode);
    setCustomName(c.name);
    setCustomCode(c.code);
  }

  function onProgramChange(code: string) {
    setProgramCode(code);
    setManualProgramCode(code);
    const nextGroups = allGroups.filter((g) => g.programCode === code);
    const firstGroup = nextGroups[0]?.code || "";
    setGroupCode(firstGroup);
    setCategoryCode(firstGroup);
    const nextCourses = courses.filter(
      (c) => c.programCode === code && (!firstGroup || c.groupCode === firstGroup)
    );
    if (nextCourses[0]) applyCourseDefaults(nextCourses[0].id);
    else {
      setCourseId("");
      setCustomName("");
      setCustomCode("");
      setCredits(2);
    }
  }

  function onGroupChange(code: string) {
    setGroupCode(code);
    setCategoryCode(code);
    const nextCourses = courses.filter(
      (c) => c.programCode === programCode && c.groupCode === code
    );
    if (nextCourses[0]) applyCourseDefaults(nextCourses[0].id);
    else {
      // 分類選修等無科目庫時，改為手動輸入該類別
      setCourseId("");
      setCustomName("");
      setCustomCode("");
      setCredits(2);
      setMode("custom");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setMessage("");

    const resolvedCategory = (mode === "catalog" ? groupCode || categoryCode : categoryCode)?.trim();
    const name = customName.trim();
    // 手動輸入一律不綁科目庫 id，避免殘留 courseId 造成第一次送出失敗
    const useCatalog = mode === "catalog" && Boolean(courseId);

    if (!name && !useCatalog) {
      setMessage("請選擇或填寫科目名稱");
      return;
    }
    if (!resolvedCategory) {
      setMessage("請選擇科目類別");
      return;
    }

    const payload = {
      courseId: useCatalog ? courseId : null,
      customName: name || null,
      customCode: useCatalog ? customCode || null : customCode.trim() || null,
      term: term.trim(),
      status,
      score: score === "" ? null : Number(score),
      credits: Number(credits),
      programCode: manualProgramCode,
      categoryCode: resolvedCategory,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "新增失敗");
        return;
      }
      setMessage("已新增");
      setScore("");
      if (!useCatalog) setCustomName("");
      router.refresh();
    } catch {
      setMessage("新增失敗，請再試一次");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeItem(id: string) {
    await fetch(`/api/enrollments?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const categorySelect = (
    <div>
      <label className="label">科目類別</label>
      <select
        className="input"
        value={mode === "catalog" ? groupCode : categoryCode}
        onChange={(e) => {
          if (mode === "catalog") onGroupChange(e.target.value);
          else setCategoryCode(e.target.value);
        }}
      >
        {groups.length === 0 ? <option value="">無類別</option> : null}
        {groupsByBlock.map(([block, items]) => (
          <optgroup key={block} label={block}>
            {items.map((g) => (
              <option key={g.code} value={g.code}>
                {g.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {isGeClassify ? (
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          通識「分類選修」四領域各至少 4 學分，請依成績單自行歸類並手動輸入科目名稱。
        </p>
      ) : null}
      {isGeCommonElective ? (
        <p className="mt-1 text-xs text-[var(--ink-muted)]">通識「共同選修」至少 2 學分。</p>
      ) : null}
      {isGePe ? (
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          體育屬校共同科目（0 學分），大一／大二須修滿 4 門不同科目名稱；請用手動輸入實際課名。
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card space-y-4 p-5">
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn ${mode === "catalog" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("catalog")}
          >
            從科目庫
          </button>
          <button
            type="button"
            className={`btn ${mode === "custom" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setMode("custom");
              setCourseId("");
              setCategoryCode(groupCode || categoryCode);
            }}
          >
            手動輸入
          </button>
        </div>

        {mode === "catalog" ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="label">學制／學程</label>
              <select
                className="input"
                value={programCode}
                onChange={(e) => onProgramChange(e.target.value)}
              >
                {programs.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {categorySelect}
            <div>
              <label className="label">科目</label>
              <select
                className="input"
                value={courseId}
                onChange={(e) => applyCourseDefaults(e.target.value)}
              >
                {filteredCourses.length === 0 ? (
                  <option value="">此類別請改用「手動輸入」</option>
                ) : null}
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}（{c.credits} 學分）
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label">學制／學程</label>
              <select
                className="input"
                value={manualProgramCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setManualProgramCode(code);
                  setProgramCode(code);
                  const next = allGroups.filter((g) => g.programCode === code);
                  const first = next[0]?.code || "";
                  setGroupCode(first);
                  setCategoryCode(first);
                }}
              >
                {programs.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {categorySelect}
          </div>
        )}

        <div className="rounded-2xl bg-[var(--bg-accent)] p-4">
          <div className="mb-3 text-sm font-medium text-[var(--brand-deep)]">
            明細欄位（選科目後會自動帶入，可手動修改）
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label">科目名稱</label>
              <input
                className="input"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required={mode === "custom" || !courseId}
                placeholder={
                  isGeClassify || isGePe ? "請輸入成績單上的實際科目名稱" : undefined
                }
              />
            </div>
            <div>
              <label className="label">學分</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">學期</label>
              <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} />
            </div>
            <div>
              <label className="label">狀態</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">成績（選填）</label>
              <input className="input" value={score} onChange={(e) => setScore(e.target.value)} placeholder="85" />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "新增中…" : "新增修課紀錄"}
        </button>
        {message ? <p className="text-sm text-[var(--brand)]">{message}</p> : null}
      </form>

      <div className="card p-5">
        <h2 className="font-semibold text-[var(--brand-deep)]">全部紀錄</h2>
        <ul className="mt-4 space-y-2">
          {enrollments.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">{e.label}</span>
                <span className="text-[var(--ink-muted)]">
                  {" "}
                  · {e.categoryName || "未歸類"} · {e.term} ·{" "}
                  {STATUS_OPTIONS.find((s) => s.value === e.status)?.label || e.status} · {e.credits}{" "}
                  學分
                </span>
                {e.score != null ? (
                  <span className={e.score < 60 ? "font-semibold text-[var(--danger)]" : ""}>
                    {" "}
                    · {e.score}
                    {e.score < 60 ? "（不及格）" : ""}
                  </span>
                ) : null}
              </div>
              <button type="button" className="btn btn-ghost !px-3 !py-1 text-xs" onClick={() => removeItem(e.id)}>
                刪除
              </button>
            </li>
          ))}
          {enrollments.length === 0 ? (
            <li className="text-sm text-[var(--ink-muted)]">尚無紀錄，可手動新增或上傳成績單。</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
