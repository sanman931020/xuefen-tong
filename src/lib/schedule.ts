/** 臺北市立大學常見節次時間（與校務課表一致） */
export const PERIODS = [
  { n: 1, start: "08:10", end: "09:00" },
  { n: 2, start: "09:10", end: "10:00" },
  { n: 3, start: "10:10", end: "11:00" },
  { n: 4, start: "11:10", end: "12:00" },
  { n: 5, start: "12:10", end: "13:00" },
  { n: 6, start: "13:10", end: "14:00" },
  { n: 7, start: "14:10", end: "15:00" },
  { n: 8, start: "15:10", end: "16:00" },
  { n: 9, start: "16:10", end: "17:00" },
  { n: 10, start: "17:10", end: "18:00" },
  { n: 11, start: "18:10", end: "19:00" },
  { n: 12, start: "19:10", end: "20:00" },
  { n: 13, start: "20:10", end: "21:00" },
  { n: 14, start: "21:10", end: "22:00" },
] as const;

export const WEEKDAYS = [
  { n: 1, label: "一" },
  { n: 2, label: "二" },
  { n: 3, label: "三" },
  { n: 4, label: "四" },
  { n: 5, label: "五" },
  { n: 6, label: "六" },
  { n: 7, label: "日" },
] as const;

/** 課表色塊（含白色＋莫蘭迪色） */
export const SCHEDULE_COLORS = [
  "#ffffff",
  "#d8ebe3",
  "#e4edd8",
  "#e8e2d4",
  "#d9e6ef",
  "#efe0d8",
  "#dde8e0",
  "#e9e5d0",
  "#dce4eb",
] as const;

/** 預設學期選項：113-1 ～ 115-1 */
export const STANDARD_TERMS = buildTermRange("113-1", "115-1");

export type ScheduleEntryDTO = {
  id: string;
  term: string;
  courseName: string;
  teacher: string;
  room: string;
  tag: string | null;
  weekday: number;
  periods: number[];
  color: string | null;
};

export function buildTermRange(from: string, to: string) {
  const start = parseTerm(from);
  const end = parseTerm(to);
  if (!start.year || !end.year) return [from, to];
  const out: string[] = [];
  let y = start.year;
  let s = start.sem === 3 ? 1 : start.sem || 1;
  const endSem = end.sem === 3 ? 2 : end.sem || 1;
  while (y < end.year || (y === end.year && s <= endSem)) {
    out.push(`${y}-${s}`);
    if (s === 1) s = 2;
    else {
      s = 1;
      y += 1;
    }
    if (out.length > 40) break;
  }
  return out;
}

export function mergeTermOptions(extra: string[] = []) {
  const set = new Set([...STANDARD_TERMS, ...extra.filter(Boolean)]);
  return [...set].sort(compareTermsDesc);
}

export function parsePeriods(raw: string): number[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(Number).filter((n) => n >= 1 && n <= 14);
  } catch {
    return [];
  }
}

/** 學期排序：越新越前，如 115-1 > 114-2 > 114-1 > 113-2 > 113-1 */
export function compareTermsDesc(a: string, b: string) {
  const pa = parseTerm(a);
  const pb = parseTerm(b);
  if (pa.year !== pb.year) return pb.year - pa.year;
  return pb.sem - pa.sem;
}

function parseTerm(term: string) {
  const m = term.trim().match(/^(\d{2,3})\s*[-–]?\s*([12Ss暑])/);
  if (!m) return { year: 0, sem: 0 };
  const year = Number(m[1]);
  const s = m[2];
  const sem = s === "2" ? 2 : s === "1" ? 1 : 3;
  return { year, sem };
}

export function pickLatestTerm(terms: string[], fallback = "115-1") {
  if (terms.length === 0) return fallback;
  return [...terms].sort(compareTermsDesc)[0];
}

export const MARK_KINDS = [
  { value: "memo", label: "備忘錄", color: "#d9e6ef" },
  { value: "holiday", label: "放假", color: "#efe0d8" },
  { value: "exam", label: "段考", color: "#e8d4d4" },
  { value: "homework", label: "交作業", color: "#e4edd8" },
  { value: "important", label: "重要備註", color: "#e9e5d0" },
] as const;

export type MarkKind = (typeof MARK_KINDS)[number]["value"];

/** 備忘錄／標記可選顏色 */
export const MARK_COLORS = [
  { value: "red", label: "紅", bg: "#f5c6c6", text: "#8b2e2e" },
  { value: "orange", label: "橙", bg: "#f5d9b8", text: "#9a5a1a" },
  { value: "yellow", label: "黃", bg: "#f5ebaa", text: "#7a6a10" },
  { value: "green", label: "綠", bg: "#c8e6c8", text: "#2d6a2d" },
  { value: "blue", label: "藍", bg: "#c5daf5", text: "#1e4a8a" },
  { value: "purple", label: "紫", bg: "#ddd0f0", text: "#5a3a8a" },
] as const;

export type MarkColor = (typeof MARK_COLORS)[number]["value"];

export function markColorStyle(color?: string | null) {
  const found = MARK_COLORS.find((c) => c.value === color);
  return found || MARK_COLORS[4]; // blue
}

export type ScheduleMarkDTO = {
  id: string;
  term: string;
  week: number;
  weekday: number;
  period: number | null;
  kind: MarkKind | string;
  content: string;
  color: MarkColor | string;
};

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatMd(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseYmd(ymd: string) {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 該日所在週的星期一 */
export function mondayOf(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function firstMondayOnOrAfter(year: number, monthIndex: number, day: number) {
  const d = new Date(year, monthIndex, day);
  const dow = d.getDay();
  if (dow === 1) return d;
  const add = dow === 0 ? 1 : 8 - dow;
  d.setDate(d.getDate() + add);
  return d;
}

/** 依學期推估第 1 週週一（上學期約 9 月、下學期約 2 月） */
export function defaultWeek1Start(term: string) {
  const t = parseTerm(term);
  if (!t.year) return toYmd(mondayOf(new Date()));
  const calYear = t.year + 1911;
  if (t.sem === 2) {
    return toYmd(firstMondayOnOrAfter(calYear + 1, 1, 1));
  }
  return toYmd(firstMondayOnOrAfter(calYear, 8, 1));
}

export function weekDateRange(week1StartYmd: string, week: number) {
  const start = parseYmd(week1StartYmd) || mondayOf(new Date());
  const mon = new Date(start);
  mon.setDate(mon.getDate() + (week - 1) * 7);
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  return {
    start: mon,
    end: sun,
    label: `${formatMd(mon)}-${formatMd(sun)}`,
    days: WEEKDAYS.map((w) => {
      const d = new Date(mon);
      d.setDate(d.getDate() + (w.n - 1));
      return { weekday: w.n, label: w.label, date: d, md: formatMd(d), ymd: toYmd(d) };
    }),
  };
}

export const CUSTOM_TERM_VALUE = "__custom__";

export const TODO_PRIORITIES = [
  { value: "red", label: "非常緊急", color: "#e8b4b4", text: "#8b3a3a", rank: 0 },
  { value: "orange", label: "急", color: "#f0d4a8", text: "#8a5a20", rank: 1 },
  { value: "green", label: "普通", color: "#c8ddd0", text: "#3d6b52", rank: 2 },
] as const;

export type TodoPriority = (typeof TODO_PRIORITIES)[number]["value"];

/** 已完成待辦：降低彩度與明度 */
export function muteHex(hex: string, satMul = 0.28, lightMul = 0.82): string {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  let r = ((n >> 16) & 255) / 255;
  let g = ((n >> 8) & 255) / 255;
  let b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  s = Math.max(0, Math.min(1, s * satMul));
  l = Math.max(0, Math.min(1, l * lightMul));

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let rr: number;
  let gg: number;
  let bb: number;
  if (s === 0) {
    rr = gg = bb = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rr = hue2rgb(p, q, h + 1 / 3);
    gg = hue2rgb(p, q, h);
    bb = hue2rgb(p, q, h - 1 / 3);
  }
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(rr)}${to(gg)}${to(bb)}`;
}

export type ScheduleTodoDTO = {
  id: string;
  term: string;
  week: number;
  content: string;
  priority: TodoPriority | string;
  done: boolean;
};

export type ScheduleHolidayDTO = {
  id: string;
  date: string;
  name: string;
};

export function sortTodos<T extends { done: boolean; priority: string; content?: string }>(list: T[]) {
  const rank: Record<string, number> = { red: 0, orange: 1, green: 2 };
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
  });
}
