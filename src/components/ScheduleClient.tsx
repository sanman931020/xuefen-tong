"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CUSTOM_TERM_VALUE,
  MARK_COLORS,
  MARK_KINDS,
  PERIODS,
  SCHEDULE_COLORS,
  STANDARD_TERMS,
  TODO_PRIORITIES,
  WEEKDAYS,
  compareTermsDesc,
  markColorStyle,
  mergeTermOptions,
  muteHex,
  sortTodos,
  weekDateRange,
  type ScheduleEntryDTO,
  type ScheduleHolidayDTO,
  type ScheduleMarkDTO,
  type ScheduleTodoDTO,
} from "@/lib/schedule";

type Mode = "settings" | "weeks";

type FormState = {
  id?: string;
  courseName: string;
  teacher: string;
  room: string;
  tag: string;
  weekday: number;
  periods: number[];
  color: string;
};

type MarkForm = {
  id?: string;
  week: number;
  weekday: number;
  period: number | "" | null;
  kind: string;
  content: string;
  color: string;
};

const emptyForm = (weekday = 1): FormState => ({
  courseName: "",
  teacher: "",
  room: "",
  tag: "",
  weekday,
  periods: [],
  color: SCHEDULE_COLORS[0],
});

export function ScheduleClient({ defaultTerm }: { defaultTerm: string }) {
  const initialTerm =
    defaultTerm && compareTermsDesc(defaultTerm, "115-1") <= 0 ? defaultTerm : "115-1";

  const [mode, setMode] = useState<Mode>("weeks");
  const [term, setTerm] = useState(initialTerm);
  const [terms, setTerms] = useState<string[]>(() => mergeTermOptions([initialTerm]));
  const [entries, setEntries] = useState<ScheduleEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showCustomTerm, setShowCustomTerm] = useState(false);
  const [customTerm, setCustomTerm] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [week, setWeek] = useState(1);
  const [week1Start, setWeek1Start] = useState("");
  const [marks, setMarks] = useState<ScheduleMarkDTO[]>([]);
  const [markDialog, setMarkDialog] = useState(false);
  const [markForm, setMarkForm] = useState<MarkForm>({
    week: 1,
    weekday: 1,
    period: "",
    kind: "memo",
    content: "",
    color: "blue",
  });
  const [markError, setMarkError] = useState("");

  const [todos, setTodos] = useState<ScheduleTodoDTO[]>([]);
  const [todoText, setTodoText] = useState("");
  const [todoPriority, setTodoPriority] = useState<"red" | "orange" | "green">("green");
  const [todoRelocate, setTodoRelocate] = useState<{
    todo: ScheduleTodoDTO;
    action: "move" | "copy";
  } | null>(null);
  const [todoRelocateWeeks, setTodoRelocateWeeks] = useState<number[]>([]);
  const [todoRelocateError, setTodoRelocateError] = useState("");
  const [todoRelocateBusy, setTodoRelocateBusy] = useState(false);

  const [holidays, setHolidays] = useState<ScheduleHolidayDTO[]>([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");

  const loadEntries = useCallback(async (t?: string) => {
    setLoading(true);
    try {
      const q = t ? `?term=${encodeURIComponent(t)}` : "";
      const res = await fetch(`/api/schedule${q}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "載入失敗");
        return;
      }
      setTerm(data.term);
      setTerms(mergeTermOptions(data.terms || []));
      setEntries(data.entries || []);
      setMessage("");
    } catch {
      setMessage("載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMetaAndMarks = useCallback(async (t: string, w: number) => {
    try {
      const [metaRes, markRes, todoRes] = await Promise.all([
        fetch(`/api/schedule/meta?term=${encodeURIComponent(t)}`),
        fetch(`/api/schedule/marks?term=${encodeURIComponent(t)}&week=${w}`),
        fetch(`/api/schedule/todos?term=${encodeURIComponent(t)}&week=${w}`),
      ]);
      const meta = await metaRes.json().catch(() => ({}));
      const markData = await markRes.json().catch(() => ({}));
      const todoData = await todoRes.json().catch(() => ({}));
      if (metaRes.ok && meta.week1Start) setWeek1Start(meta.week1Start);
      if (markRes.ok) setMarks(markData.marks || []);
      if (todoRes.ok) setTodos(sortTodos(todoData.todos || []));
    } catch {
      /* ignore */
    }
  }, []);

  const loadHolidays = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule/holidays");
      const data = await res.json().catch(() => ({}));
      if (res.ok) setHolidays(data.holidays || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadEntries();
    void loadHolidays();
  }, [loadEntries, loadHolidays]);

  useEffect(() => {
    if (!term) return;
    if (mode === "weeks") {
      void loadMetaAndMarks(term, week);
    } else {
      // 設定頁也需載入第 1 週起始日
      void fetch(`/api/schedule/meta?term=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((meta) => {
          if (meta?.week1Start) setWeek1Start(meta.week1Start);
        })
        .catch(() => {});
    }
  }, [mode, term, week, loadMetaAndMarks]);

  const grid = useMemo(() => {
    const map = new Map<string, ScheduleEntryDTO>();
    for (const e of entries) {
      for (const p of e.periods) map.set(`${e.weekday}-${p}`, e);
    }
    return map;
  }, [entries]);

  const range = useMemo(() => {
    if (!week1Start) return null;
    return weekDateRange(week1Start, week);
  }, [week1Start, week]);

  const markFormRange = useMemo(() => {
    if (!week1Start || !markForm.week) return null;
    return weekDateRange(week1Start, markForm.week);
  }, [week1Start, markForm.week]);

  function onTermSelect(value: string) {
    if (value === CUSTOM_TERM_VALUE) {
      setShowCustomTerm(true);
      setCustomTerm("");
      return;
    }
    setShowCustomTerm(false);
    setTerm(value);
    void loadEntries(value);
  }

  function confirmCustomTerm() {
    const t = customTerm.trim();
    if (t.length < 3) {
      setMessage("學期格式例如 115-2");
      return;
    }
    setTerms((prev) => mergeTermOptions([...prev, t]));
    setShowCustomTerm(false);
    setCustomTerm("");
    setTerm(t);
    setEntries([]);
    setMessage("");
    void loadEntries(t);
  }

  function openCreate(weekday?: number, period?: number) {
    const base = emptyForm(weekday ?? 1);
    if (period) base.periods = [period];
    base.color = SCHEDULE_COLORS[(entries.length + 1) % SCHEDULE_COLORS.length];
    setForm(base);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(entry: ScheduleEntryDTO) {
    setForm({
      id: entry.id,
      courseName: entry.courseName,
      teacher: entry.teacher,
      room: entry.room,
      tag: entry.tag || "",
      weekday: entry.weekday,
      periods: [...entry.periods],
      color: entry.color || SCHEDULE_COLORS[0],
    });
    setFormError("");
    setDialogOpen(true);
  }

  function togglePeriod(n: number) {
    setForm((f) => ({
      ...f,
      periods: f.periods.includes(n)
        ? f.periods.filter((p) => p !== n)
        : [...f.periods, n].sort((a, b) => a - b),
    }));
  }

  async function saveEntry(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!form.courseName.trim()) {
      setFormError("請填寫課程名稱");
      return;
    }
    if (form.periods.length === 0) {
      setFormError("請至少勾選一個節次");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const payload = {
        id: form.id,
        term,
        courseName: form.courseName.trim(),
        teacher: form.teacher.trim(),
        room: form.room.trim(),
        tag: form.tag.trim() || null,
        weekday: form.weekday,
        periods: form.periods,
        color: form.color,
      };
      const res = await fetch("/api/schedule", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "儲存失敗");
        return;
      }
      setDialogOpen(false);
      if (data.entry) {
        setEntries((prev) =>
          form.id ? prev.map((x) => (x.id === data.entry.id ? data.entry : x)) : [...prev, data.entry]
        );
      }
      void loadEntries(term);
    } catch {
      setFormError("儲存失敗，請重新啟動開發伺服器後再試");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteEntry() {
    if (!form.id || submitting) return;
    if (!window.confirm("確定刪除此課程時段？")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/schedule?id=${encodeURIComponent(form.id)}`, { method: "DELETE" });
      if (!res.ok) {
        setFormError("刪除失敗");
        return;
      }
      const deletedId = form.id;
      setDialogOpen(false);
      setEntries((prev) => prev.filter((x) => x.id !== deletedId));
    } finally {
      setSubmitting(false);
    }
  }

  async function saveWeek1Start(ymd: string) {
    setWeek1Start(ymd);
    await fetch("/api/schedule/meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, week1Start: ymd }),
    });
  }

  function openMark(weekday: number, period?: number | null) {
    setMarkForm({
      week,
      weekday,
      period: period === undefined ? "" : period,
      kind: "memo",
      content: "",
      color: "blue",
    });
    setMarkError("");
    setMarkDialog(true);
  }

  function openEditMark(m: ScheduleMarkDTO) {
    setMarkForm({
      id: m.id,
      week: m.week,
      weekday: m.weekday,
      period: m.period ?? "",
      kind: m.kind,
      content: m.content,
      color: m.color || "blue",
    });
    setMarkError("");
    setMarkDialog(true);
  }

  async function saveMark(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMarkError("");
    try {
      const targetWeek = markForm.week;
      const payload = {
        id: markForm.id,
        term,
        week: targetWeek,
        weekday: markForm.weekday,
        period: markForm.period === "" || markForm.period == null ? null : Number(markForm.period),
        kind: markForm.kind,
        content: markForm.content.trim(),
        color: markForm.color,
      };
      const res = await fetch("/api/schedule/marks", {
        method: markForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMarkError(typeof data.error === "string" ? data.error : "儲存失敗");
        return;
      }
      setMarkDialog(false);
      if (targetWeek !== week) setWeek(targetWeek);
      else void loadMetaAndMarks(term, week);
    } catch {
      setMarkError("儲存失敗");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteMark() {
    if (!markForm.id || submitting) return;
    if (!window.confirm("確定刪除此標記？")) return;
    setSubmitting(true);
    try {
      await fetch(`/api/schedule/marks?id=${encodeURIComponent(markForm.id)}`, { method: "DELETE" });
      setMarkDialog(false);
      void loadMetaAndMarks(term, week);
    } finally {
      setSubmitting(false);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!todoText.trim()) return;
    const res = await fetch("/api/schedule/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        term,
        week,
        content: todoText.trim(),
        priority: todoPriority,
      }),
    });
    if (!res.ok) return;
    setTodoText("");
    void loadMetaAndMarks(term, week);
  }

  async function toggleTodo(todo: ScheduleTodoDTO) {
    const res = await fetch("/api/schedule/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todo.id, done: !todo.done }),
    });
    if (!res.ok) return;
    setTodos((prev) => sortTodos(prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))));
  }

  async function deleteTodo(id: string) {
    await fetch(`/api/schedule/todos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function openTodoRelocate(todo: ScheduleTodoDTO, action: "move" | "copy") {
    setTodoRelocate({ todo, action });
    setTodoRelocateWeeks([]);
    setTodoRelocateError("");
  }

  function toggleRelocateWeek(w: number) {
    setTodoRelocateWeeks((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].sort((a, b) => a - b)));
  }

  async function confirmTodoRelocate(e: React.FormEvent) {
    e.preventDefault();
    if (!todoRelocate || todoRelocateBusy) return;
    if (todoRelocateWeeks.length === 0) {
      setTodoRelocateError("請至少勾選一個週次");
      return;
    }
    setTodoRelocateBusy(true);
    setTodoRelocateError("");
    try {
      const res = await fetch("/api/schedule/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todoRelocate.todo.id,
          action: todoRelocate.action,
          weeks: todoRelocateWeeks,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTodoRelocateError(typeof data.error === "string" ? data.error : "操作失敗");
        return;
      }
      setTodoRelocate(null);
      if (todoRelocate.action === "move") {
        const first = todoRelocateWeeks[0];
        if (first && first !== week) setWeek(first);
        else void loadMetaAndMarks(term, week);
      } else {
        void loadMetaAndMarks(term, week);
      }
    } catch {
      setTodoRelocateError("操作失敗");
    } finally {
      setTodoRelocateBusy(false);
    }
  }

  async function addHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!holidayDate || !holidayName.trim()) {
      setMessage("請填寫假日日期與名稱");
      return;
    }
    const res = await fetch("/api/schedule/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: holidayDate, name: holidayName.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(typeof data.error === "string" ? data.error : "假日儲存失敗");
      return;
    }
    setHolidayDate("");
    setHolidayName("");
    setMessage("");
    void loadHolidays();
  }

  async function removeHoliday(id: string) {
    await fetch(`/api/schedule/holidays?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  }

  function holidayForWeekday(weekday: number) {
    const ymd = range?.days.find((d) => d.weekday === weekday)?.ymd;
    if (!ymd) return null;
    return holidays.find((h) => h.date === ymd) || null;
  }

  const kindLabel = (k: string) => MARK_KINDS.find((x) => x.value === k)?.label || k;
  const markBg = (m: ScheduleMarkDTO) => markColorStyle(m.color).bg;

  /** 同堂連續節次：回傳 rowspan；若已被上方合併則 skip */
  function cellSpan(weekday: number, period: number) {
    const cell = grid.get(`${weekday}-${period}`);
    if (!cell) return { skip: false, rowspan: 1, entry: null as ScheduleEntryDTO | null };
    if (period > 1) {
      const prev = grid.get(`${weekday}-${period - 1}`);
      if (prev && prev.id === cell.id) {
        return { skip: true, rowspan: 0, entry: cell };
      }
    }
    let rowspan = 1;
    for (let n = period + 1; n <= 14; n++) {
      const next = grid.get(`${weekday}-${n}`);
      if (next && next.id === cell.id) rowspan += 1;
      else break;
    }
    return { skip: false, rowspan, entry: cell };
  }

  const PERIOD_ROW_PX = 74;
  const WEEK_ROW_PX = 68;
  const priorityMeta = (p: string) => TODO_PRIORITIES.find((x) => x.value === p) || TODO_PRIORITIES[2];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-3 sm:gap-y-2">
        <div className="flex flex-wrap items-end gap-x-2 gap-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[var(--brand-deep)] sm:text-5xl md:text-6xl">
            課表
          </h1>
          <button
            type="button"
            className={`btn !min-h-10 !px-3 !py-1.5 text-sm ${mode === "weeks" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("weeks")}
          >
            週課表
          </button>
          <button
            type="button"
            className={`btn !min-h-10 !px-3 !py-1.5 text-sm ${mode === "settings" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("settings")}
          >
            設定
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 sm:flex-none">
            <label className="label !mb-0.5" htmlFor="schedule-term">
              學期
            </label>
            <select
              id="schedule-term"
              className="input !w-full min-w-0 !py-1.5 text-sm sm:!w-auto sm:min-w-[9rem]"
              value={showCustomTerm ? CUSTOM_TERM_VALUE : term}
              onChange={(e) => onTermSelect(e.target.value)}
            >
              <option value={CUSTOM_TERM_VALUE}>自行輸入…</option>
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                  {STANDARD_TERMS.includes(t) ? "" : "（自訂）"}
                </option>
              ))}
            </select>
          </div>
          {mode === "settings" ? (
            <button type="button" className="btn btn-primary !min-h-10 !px-3 !py-1.5 text-sm" onClick={() => openCreate()}>
              建立專屬課表
            </button>
          ) : null}
          <span className="pb-1.5 text-sm text-[var(--ink-muted)]">
            {mode === "settings" ? `目前 ${entries.length} 門時段` : `第 ${week} 週`}
          </span>
        </div>
      </div>

      {showCustomTerm ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-accent)]/50 p-3">
          <label className="label" htmlFor="custom-term">
            自行輸入學期
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="custom-term"
              className="input !w-36"
              placeholder="例如 115-2"
              value={customTerm}
              autoFocus
              onChange={(e) => setCustomTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmCustomTerm();
                }
              }}
            />
            <button type="button" className="btn btn-primary !px-3 !py-1.5 text-sm" onClick={confirmCustomTerm}>
              確定
            </button>
            <button
              type="button"
              className="btn btn-ghost !px-3 !py-1.5 text-sm"
              onClick={() => {
                setShowCustomTerm(false);
                setCustomTerm("");
              }}
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      {mode === "settings" ? (
        <div className="card space-y-4 p-4">
          <div>
            <div className="font-semibold text-[var(--brand-deep)]">第 1 週起始日</div>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              設定本學期第 1 週的週一日期，週課表才會顯示正確日期區間。
            </p>
            <div className="mt-2">
              <label className="label" htmlFor="week1">
                第 1 週週一
              </label>
              <input
                id="week1"
                type="date"
                className="input !w-auto"
                value={week1Start}
                onChange={(e) => void saveWeek1Start(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="font-semibold text-[var(--brand-deep)]">國定假日（手動設定）</div>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              設定後，週課表遇到該日會隱藏課程並顯示「○○放假」。
            </p>
            <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={addHoliday}>
              <div>
                <label className="label" htmlFor="hol-date">
                  日期
                </label>
                <input
                  id="hol-date"
                  type="date"
                  className="input !w-auto"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  required
                />
              </div>
              <div className="min-w-[10rem] flex-1">
                <label className="label" htmlFor="hol-name">
                  假日名稱
                </label>
                <input
                  id="hol-name"
                  className="input"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="例如：中秋節"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary !px-4 !py-2 text-sm">
                新增假日
              </button>
            </form>
            {holidays.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {holidays.map((h) => (
                  <li
                    key={h.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-medium">{h.name}</span>
                      <span className="text-[var(--ink-muted)]"> · {h.date}</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs text-[var(--danger)]"
                      onClick={() => void removeHoliday(h.id)}
                    >
                      刪除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[var(--ink-muted)]">尚未設定國定假日。</p>
            )}
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm text-[var(--danger)]">{message}</p> : null}
      {loading && mode === "settings" ? (
        <p className="text-sm text-[var(--ink-muted)]">載入中…</p>
      ) : null}

      {mode === "weeks" ? (
        <div className="space-y-4">
          {/* 中：課表 Week 切換｜右：備忘錄（同橫排對齊；手機改直向） */}
          <div className="card grid grid-cols-1 items-center gap-3 p-3 sm:grid-cols-[1fr_auto] sm:p-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="hidden md:block" aria-hidden />

            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <button
                type="button"
                className="btn btn-ghost !min-h-11 !min-w-11 !px-3 !py-2 text-xl leading-none"
                disabled={week <= 1}
                onClick={() => setWeek((w) => Math.max(1, w - 1))}
                aria-label="上一週"
              >
                ‹
              </button>
              <div className="min-w-0 flex-1 text-center sm:min-w-[10rem] sm:flex-none">
                <div className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--brand-deep)] sm:text-xl md:text-2xl">
                  課表 Week {week}
                </div>
                {range ? (
                  <div className="mt-0.5 text-xs font-medium text-[var(--ink-muted)] sm:text-sm">{range.label}</div>
                ) : null}
              </div>
              <button
                type="button"
                className="btn btn-ghost !min-h-11 !min-w-11 !px-3 !py-2 text-xl leading-none"
                disabled={week >= 16}
                onClick={() => setWeek((w) => Math.min(16, w + 1))}
                aria-label="下一週"
              >
                ›
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full !min-h-11 !px-4 !py-2 text-sm md:w-auto md:justify-self-end"
              onClick={() => openMark(1)}
            >
              備忘錄／標記
            </button>
          </div>

          <div>
            <p className="mb-1.5 text-xs text-[var(--ink-muted)] md:hidden">左右滑動可查看完整週課表</p>
            <div className="overflow-x-auto overscroll-x-contain rounded-2xl border-2 border-[var(--line)] bg-white shadow-[var(--shadow)] [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-[11px] sm:min-w-[780px] sm:text-xs md:min-w-[900px]">
              <colgroup>
                <col className="w-[5.25rem]" />
                {WEEKDAYS.map((d) => (
                  <col key={d.n} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border border-[var(--line)] bg-[#f0f0f0] px-1 py-3 text-center font-semibold text-[var(--ink)]">
                    時間
                  </th>
                  {WEEKDAYS.map((d, i) => {
                    const day = range?.days[i];
                    const hol = holidayForWeekday(d.n);
                    return (
                      <th
                        key={d.n}
                        className="border border-[var(--line)] bg-white px-1 py-2.5 text-center font-bold text-[var(--ink)]"
                      >
                        <div className="text-sm">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat.", "Sun."][i]}
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-[var(--ink-muted)]">
                          星期{d.label}
                          {day ? ` ${day.md}` : ""}
                        </div>
                        {hol ? (
                          <div className="mt-1 text-[10px] font-semibold text-[#a87878]">{hol.name}放假</div>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p) => {
                  const isLunch = p.n === 5;
                  return (
                    <tr key={p.n} style={{ height: WEEK_ROW_PX }}>
                      <th
                        className={`sticky left-0 z-10 border border-[var(--line)] px-1 py-1 text-center font-medium ${
                          isLunch ? "bg-[#e8e8e8] text-[var(--ink-muted)]" : "bg-[#f7f7f7] text-[var(--ink)]"
                        }`}
                      >
                        {isLunch ? (
                          <>
                            <div className="text-[11px] font-semibold">午休</div>
                            <div className="text-[9px]">
                              {p.start.replace(":", "")}-{p.end.replace(":", "")}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[11px]">
                              {p.start.replace(":", "")}-{p.end.replace(":", "")}
                            </div>
                            <div className="text-[9px] text-[var(--ink-muted)]">第 {p.n} 節</div>
                          </>
                        )}
                      </th>
                      {WEEKDAYS.map((d) => {
                        const hol = holidayForWeekday(d.n);
                        if (hol) {
                          if (p.n !== 1) return null;
                          return (
                            <td
                              key={`${d.n}-hol`}
                              rowSpan={14}
                              className="max-w-0 border border-[var(--line)] bg-[#f5eeee] p-0 align-top"
                            >
                              <button
                                type="button"
                                className="flex h-full min-h-[16rem] w-full flex-col items-start justify-start gap-1 px-2 py-3 text-left"
                                onClick={() => openMark(d.n, null)}
                              >
                                <span className="text-sm font-bold text-[#a05050]">{hol.name}放假</span>
                                <span className="text-[11px] text-[var(--ink-muted)]">當日課程不顯示</span>
                              </button>
                            </td>
                          );
                        }

                        const { skip, rowspan, entry } = cellSpan(d.n, p.n);
                        if (skip) return null;
                        const periodMarks = marks.filter((m) => m.weekday === d.n && m.period === p.n);
                        const dayWide = marks.filter((m) => m.weekday === d.n && m.period == null);
                        const showMarks = periodMarks.length > 0 ? periodMarks : p.n === 1 ? dayWide : [];

                        return (
                          <td
                            key={`${d.n}-${p.n}`}
                            rowSpan={rowspan > 1 ? rowspan : undefined}
                            className={`max-w-0 border border-[var(--line)] p-0 align-top ${
                              isLunch && !entry ? "bg-[#f3f3f3]" : "bg-white"
                            }`}
                            style={{ height: WEEK_ROW_PX * rowspan }}
                          >
                            {entry ? (
                              <button
                                type="button"
                                className="box-border flex h-full w-full flex-col items-start justify-start gap-0.5 overflow-hidden px-1.5 py-1.5 text-left transition hover:brightness-[0.97]"
                                style={{
                                  background: entry.color || "#ffffff",
                                  minHeight: WEEK_ROW_PX * rowspan,
                                }}
                                onClick={() => openMark(d.n, p.n)}
                                title="點擊新增／查看本節標記"
                              >
                                <span className="w-full break-words font-semibold leading-snug text-[var(--brand-deep)] [overflow-wrap:anywhere]">
                                  {entry.courseName}
                                  {entry.tag ? ` 【${entry.tag}】` : ""}
                                </span>
                                {entry.teacher ? (
                                  <span className="w-full break-words text-[11px] leading-snug [overflow-wrap:anywhere]">
                                    {entry.teacher}
                                  </span>
                                ) : null}
                                {entry.room ? (
                                  <span className="w-full break-words text-[10px] leading-snug text-[var(--ink-muted)] [overflow-wrap:anywhere]">
                                    {entry.room}
                                  </span>
                                ) : null}
                                {periodMarks.map((m) => (
                                  <span
                                    key={m.id}
                                    className="mt-0.5 rounded px-1 text-[9px] font-medium"
                                    style={{ background: markBg(m), color: markColorStyle(m.color).text }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditMark(m);
                                    }}
                                  >
                                    {kindLabel(m.kind)}
                                    {m.content ? ` ${m.content}` : ""}
                                  </span>
                                ))}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className={`flex h-full w-full flex-col items-start justify-start gap-0.5 px-1.5 py-1 text-left transition hover:bg-[var(--brand-soft)]/40 ${
                                  isLunch ? "text-[var(--ink-muted)]" : ""
                                }`}
                                style={{ minHeight: WEEK_ROW_PX }}
                                onClick={() => openMark(d.n, isLunch ? null : p.n)}
                              >
                                {showMarks.length > 0 ? (
                                  showMarks.map((m) => (
                                    <span
                                      key={m.id}
                                      className="w-full break-words rounded px-1 py-0.5 text-[10px] font-medium leading-snug [overflow-wrap:anywhere]"
                                      style={{ background: markBg(m), color: markColorStyle(m.color).text }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditMark(m);
                                      }}
                                    >
                                      {kindLabel(m.kind)}
                                      {m.content ? `：${m.content}` : ""}
                                    </span>
                                  ))
                                ) : isLunch ? (
                                  <span className="text-[10px] opacity-50">午休</span>
                                ) : null}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>

          {/* 該週 TO DO LIST */}
          <div className="rounded-2xl border-2 border-[var(--line)] bg-[#f7f4ef] px-3 py-4 sm:px-4">
            <div className="mb-3 font-bold tracking-wide text-[var(--brand-deep)]">
              第 {week} 週 TO DO LIST
            </div>
            <form className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={addTodo}>
              <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                <label className="label" htmlFor="todo-text">
                  新增待辦
                </label>
                <input
                  id="todo-text"
                  className="input"
                  value={todoText}
                  onChange={(e) => setTodoText(e.target.value)}
                  placeholder="例如：繳交期中報告"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="label">緊急程度</label>
                <select
                  className="input sm:!w-auto"
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value as "red" | "orange" | "green")}
                >
                  {TODO_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-full !min-h-11 !px-4 !py-2 text-sm sm:w-auto">
                加入
              </button>
            </form>

            {todos.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">本週尚無待辦。完成後打勾會移到下方並劃掉。</p>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => {
                  const meta = priorityMeta(todo.priority);
                  const bg = todo.done ? muteHex(meta.color) : meta.color;
                  const fg = todo.done ? muteHex(meta.text, 0.4, 0.75) : meta.text;
                  return (
                    <li
                      key={todo.id}
                      className={`flex flex-col gap-2 rounded-xl px-3 py-2.5 sm:flex-row sm:items-start ${todo.done ? "opacity-90" : ""}`}
                      style={{ background: bg }}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]"
                          checked={todo.done}
                          onChange={() => void toggleTodo(todo)}
                          aria-label="完成"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-semibold"
                              style={{ color: fg }}
                            >
                              {meta.label}
                            </span>
                            <span
                              className={`break-words text-sm [overflow-wrap:anywhere] ${todo.done ? "line-through" : "font-medium"}`}
                              style={{ color: todo.done ? fg : meta.text }}
                            >
                              {todo.content}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 border-t border-black/5 pt-2 sm:border-0 sm:pt-0">
                        <button
                          type="button"
                          className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink-muted)] hover:bg-white/50 hover:text-[var(--brand-deep)]"
                          onClick={() => openTodoRelocate(todo, "move")}
                        >
                          移動
                        </button>
                        <button
                          type="button"
                          className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink-muted)] hover:bg-white/50 hover:text-[var(--brand-deep)]"
                          onClick={() => openTodoRelocate(todo, "copy")}
                        >
                          複製
                        </button>
                        <button
                          type="button"
                          className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink-muted)] hover:bg-white/50 hover:text-[var(--danger)]"
                          onClick={() => void deleteTodo(todo.id)}
                        >
                          刪除
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-[var(--line)] bg-white/90 shadow-[var(--shadow)] [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[560px] table-fixed border-collapse text-left text-[11px] sm:min-w-[720px] sm:text-xs">
            <colgroup>
              <col className="w-[4.75rem]" />
              {WEEKDAYS.map((d) => (
                <col key={d.n} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border border-[var(--line)] bg-[var(--bg-accent)] px-1.5 py-2.5 text-center font-semibold text-[var(--brand-deep)]">
                  節次
                </th>
                {WEEKDAYS.map((d) => (
                  <th
                    key={d.n}
                    className="border border-[var(--line)] bg-[var(--bg-accent)] px-1 py-2.5 text-center font-semibold text-[var(--brand-deep)]"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p.n} style={{ height: PERIOD_ROW_PX }}>
                  <th className="sticky left-0 z-10 border border-[var(--line)] bg-[var(--bg-accent)]/80 px-1 py-1 text-center font-medium text-[var(--ink)]">
                    <div className="text-[12px]">第 {p.n} 節</div>
                    <div className="mt-0.5 text-[9px] font-normal leading-tight text-[var(--ink-muted)]">
                      {p.start}
                      <br />
                      {p.end}
                    </div>
                  </th>
                  {WEEKDAYS.map((d) => {
                    const { skip, rowspan, entry } = cellSpan(d.n, p.n);
                    if (skip) return null;
                    return (
                      <td
                        key={`${d.n}-${p.n}`}
                        rowSpan={rowspan > 1 ? rowspan : undefined}
                        className="max-w-0 border border-[var(--line)] p-0 align-top"
                        style={{ height: PERIOD_ROW_PX * rowspan }}
                      >
                        {entry ? (
                          <button
                            type="button"
                            className="box-border flex h-full w-full flex-col items-start gap-0.5 overflow-hidden px-1.5 py-1.5 text-left transition hover:brightness-[0.97]"
                            style={{
                              background: entry.color || "#ffffff",
                              minHeight: PERIOD_ROW_PX * rowspan,
                            }}
                            onClick={() => openEdit(entry)}
                          >
                            <span className="w-full break-words font-semibold leading-snug text-[var(--brand-deep)] [overflow-wrap:anywhere]">
                              {entry.courseName}
                              {entry.tag ? (
                                <span className="font-medium text-[var(--ink-muted)]"> 【{entry.tag}】</span>
                              ) : null}
                            </span>
                            {entry.teacher ? (
                              <span className="w-full break-words text-[11px] leading-snug text-[var(--ink)] [overflow-wrap:anywhere]">
                                {entry.teacher}
                              </span>
                            ) : null}
                            {entry.room ? (
                              <span className="w-full break-words text-[10px] leading-snug text-[var(--ink-muted)] [overflow-wrap:anywhere]">
                                {entry.room}
                              </span>
                            ) : null}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="h-full w-full bg-[var(--bg)]/40 transition hover:bg-[var(--brand-soft)]/50"
                            style={{ minHeight: PERIOD_ROW_PX }}
                            aria-label={`新增星期${d.label}第${p.n}節`}
                            onClick={() => openCreate(d.n, p.n)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !submitting && setDialogOpen(false)}
        >
          <form
            className="card max-h-[min(90dvh,44rem)] w-full max-w-lg space-y-4 overflow-y-auto p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveEntry}
          >
            <h2 className="text-lg font-bold text-[var(--brand-deep)]">
              {form.id ? "編輯課程時段" : "新增課程時段"}
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">學期 {term}</p>

            <div>
              <label className="label" htmlFor="sch-name">
                課程名稱
              </label>
              <input
                id="sch-name"
                className="input"
                value={form.courseName}
                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">授課教師</label>
                <input
                  className="input"
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                />
              </div>
              <div>
                <label className="label">標籤（選填）</label>
                <input
                  className="input"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="本系／不限"
                />
              </div>
            </div>
            <div>
              <label className="label">教室</label>
              <input
                className="input"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
            </div>
            <div>
              <label className="label">星期</label>
              <select
                className="input"
                value={form.weekday}
                onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })}
              >
                {WEEKDAYS.map((d) => (
                  <option key={d.n} value={d.n}>
                    星期{d.label}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">節次（可複選）</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {PERIODS.map((p) => {
                  const on = form.periods.includes(p.n);
                  return (
                    <label
                      key={p.n}
                      className={`cursor-pointer rounded-lg border px-1.5 py-2 text-center text-xs ${
                        on
                          ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold"
                          : "border-[var(--line)] bg-white text-[var(--ink-muted)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={() => togglePeriod(p.n)}
                      />
                      <div>第 {p.n} 節</div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div>
              <div className="label">色塊</div>
              <div className="flex flex-wrap gap-2">
                {SCHEDULE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-7 w-7 rounded-full border-2 ${
                      form.color === c ? "border-[var(--brand-deep)]" : "border-[var(--line)]"
                    }`}
                    style={{ background: c }}
                    onClick={() => setForm({ ...form, color: c })}
                  />
                ))}
              </div>
            </div>
            {formError ? <p className="text-sm text-[var(--danger)]">{formError}</p> : null}
            <div className="flex flex-wrap justify-between gap-2">
              {form.id ? (
                <button type="button" className="btn btn-ghost text-[var(--danger)]" onClick={deleteEntry}>
                  刪除
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setDialogOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "儲存中…" : "儲存"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {markDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !submitting && setMarkDialog(false)}
        >
          <form
            className="card max-h-[min(90dvh,40rem)] w-full max-w-md space-y-4 overflow-y-auto p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveMark}
          >
            <h2 className="text-lg font-bold text-[var(--brand-deep)]">
              {markForm.id ? "編輯標記" : "新增備忘錄／標記"}
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              可選擇任意週次；預設為目前瀏覽的第 {week} 週。
            </p>

            <div>
              <label className="label">週次</label>
              <select
                className="input"
                value={markForm.week}
                onChange={(e) => setMarkForm({ ...markForm, week: Number(e.target.value) })}
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
                  const r = week1Start ? weekDateRange(week1Start, w) : null;
                  return (
                    <option key={w} value={w}>
                      第 {w} 週{r ? `（${r.label}）` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="label">類型</label>
              <div className="flex flex-wrap gap-2">
                {MARK_KINDS.map((k) => (
                  <label
                    key={k.value}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                      markForm.kind === k.value
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={markForm.kind === k.value}
                      onChange={() => setMarkForm({ ...markForm, kind: k.value })}
                    />
                    {k.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">顏色</label>
              <div className="flex flex-wrap gap-2">
                {MARK_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      markForm.color === c.value ? "border-[var(--brand-deep)] ring-2 ring-[var(--brand)]/40" : "border-white"
                    }`}
                    style={{ background: c.bg, color: c.text }}
                    onClick={() => setMarkForm({ ...markForm, color: c.value })}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={markForm.color === c.value}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">星期</label>
                <select
                  className="input"
                  value={markForm.weekday}
                  onChange={(e) => setMarkForm({ ...markForm, weekday: Number(e.target.value) })}
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d.n} value={d.n}>
                      星期{d.label}
                      {markFormRange ? ` ${markFormRange.days[d.n - 1]?.md}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">節次（可選整天）</label>
                <select
                  className="input"
                  value={markForm.period === "" || markForm.period == null ? "" : String(markForm.period)}
                  onChange={(e) =>
                    setMarkForm({
                      ...markForm,
                      period: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                >
                  <option value="">整天</option>
                  {PERIODS.map((p) => (
                    <option key={p.n} value={p.n}>
                      第 {p.n} 節
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">內容</label>
              <textarea
                className="input min-h-[5rem]"
                value={markForm.content}
                onChange={(e) => setMarkForm({ ...markForm, content: e.target.value })}
                placeholder="例如：期中考範圍第1–5章／繳交報告"
              />
            </div>

            {markError ? <p className="text-sm text-[var(--danger)]">{markError}</p> : null}

            <div className="flex flex-wrap justify-between gap-2">
              {markForm.id ? (
                <button type="button" className="btn btn-ghost text-[var(--danger)]" onClick={deleteMark}>
                  刪除
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setMarkDialog(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "儲存中…" : "儲存"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {todoRelocate ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !todoRelocateBusy && setTodoRelocate(null)}
        >
          <form
            className="card max-h-[min(90dvh,40rem)] w-full max-w-md space-y-4 overflow-y-auto p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
            onSubmit={confirmTodoRelocate}
          >
            <h2 className="text-lg font-bold text-[var(--brand-deep)]">
              {todoRelocate.action === "move" ? "移動待辦" : "複製待辦"}
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              {todoRelocate.action === "move"
                ? "勾選目標週次後，此筆會從本週移除並移到所選週次。"
                : "勾選目標週次後，本週保留原筆，並在所選週次各新增一筆相同內容。"}
            </p>
            <p className="rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm font-medium [overflow-wrap:anywhere]">
              {todoRelocate.todo.content}
            </p>

            <div>
              <div className="label mb-2">勾選週次</div>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-8">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
                  const isCurrent = w === week;
                  const disabled = todoRelocate.action === "copy" && isCurrent;
                  const checked = todoRelocateWeeks.includes(w);
                  return (
                    <label
                      key={w}
                      className={`flex min-h-10 cursor-pointer items-center justify-center gap-1 rounded-lg border px-1.5 py-1.5 text-xs sm:justify-start sm:gap-1.5 sm:px-2 sm:text-sm ${
                        disabled
                          ? "cursor-not-allowed border-[var(--line)] opacity-45"
                          : checked
                            ? "border-[var(--brand)] bg-[var(--brand-soft)] font-semibold"
                            : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-[var(--brand)]"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleRelocateWeek(w)}
                      />
                      <span className="leading-tight">
                        {w}
                        <span className="hidden sm:inline">週</span>
                        {isCurrent ? <span className="hidden md:inline">（目前）</span> : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {todoRelocateError ? <p className="text-sm text-[var(--danger)]">{todoRelocateError}</p> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-ghost w-full !min-h-11 sm:w-auto"
                disabled={todoRelocateBusy}
                onClick={() => setTodoRelocate(null)}
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary w-full !min-h-11 sm:w-auto" disabled={todoRelocateBusy}>
                {todoRelocateBusy ? "處理中…" : todoRelocate.action === "move" ? "確定移動" : "確定複製"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
