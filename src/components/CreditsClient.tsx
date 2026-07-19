"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/ui";
import type { DomainTrack } from "@/lib/eduElemDomains";

export type CreditsCourseRow = {
  id: string;
  name: string;
  credits: number;
  score: number | null;
  status: string | null;
  required: boolean;
  domain?: string | null;
  notes?: string | null;
};

export type CreditsGroupView = {
  code: string;
  name: string;
  minCredits: number;
  earnedCredits: number;
  plannedCredits: number;
  remaining: number;
  percent: number;
  description?: string | null;
  courses: CreditsCourseRow[];
};

export type CreditsNonCredit = {
  code: string;
  name: string;
  description: string | null;
};

export type CreditsHandbook = {
  label: string;
  browseUrl: string;
  downloadUrl: string;
  downloadName: string;
};

export type CreditsProgramView = {
  id: string;
  code?: string;
  name: string;
  description: string | null;
  totalRequired: number | null;
  earnedCredits: number;
  handbook?: CreditsHandbook | null;
  domainTracks?: DomainTrack[];
  groups: CreditsGroupView[];
  nonCredits: CreditsNonCredit[];
};

function StatusMark({ kind }: { kind: "done" | "missing" }) {
  if (kind === "done") {
    return (
      <span
        className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#7a9e8a] text-[10px] leading-none text-white"
        aria-label="已完成"
        title="已完成"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#c4a4a4] text-[10px] leading-none text-white"
      aria-label="尚未修習"
      title="尚未修習"
    >
      ✕
    </span>
  );
}

function scoreLabel(row: CreditsCourseRow) {
  if (row.score != null) {
    const failed = row.score < 60 || row.status === "failed";
    return (
      <span className={`inline-flex items-center ${failed ? "font-semibold text-[var(--danger)]" : ""}`}>
        {row.score} 分{failed ? "（未及格）" : ""}
        {!failed ? <StatusMark kind="done" /> : null}
      </span>
    );
  }
  if (row.status === "transferred") {
    return (
      <span className="inline-flex items-center text-[var(--ink-muted)]">
        抵免
        <StatusMark kind="done" />
      </span>
    );
  }
  if (row.status === "in_progress" || row.status === "taken") {
    return <span className="text-[var(--ink-muted)]">成績未到</span>;
  }
  if (row.required && !row.status) {
    return (
      <span className="inline-flex items-center text-[var(--ink-muted)]">
        尚未修習
        <StatusMark kind="missing" />
      </span>
    );
  }
  return <span className="text-[var(--ink-muted)]">成績未到</span>;
}

function CourseList({ courses }: { courses: CreditsCourseRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const needToggle = courses.length > 4;
  const visible = needToggle && !expanded ? courses.slice(0, 4) : courses;

  if (courses.length === 0) {
    return <p className="mt-3 text-sm text-[var(--ink-muted)]">尚無已修／修習中科目</p>;
  }

  return (
    <div className="mt-3">
      <ul className="grid gap-2 sm:grid-cols-2">
        {visible.map((c) => (
          <li key={c.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm">
            <span className="font-medium">{c.name}</span>
            {c.required ? (
              <span className="ml-1 text-xs text-[var(--brand)]">必修</span>
            ) : null}
            {c.domain ? (
              <span className="ml-1 text-xs text-[var(--ink-muted)]">（{c.domain}）</span>
            ) : null}
            <span className="text-[var(--ink-muted)]"> · {c.credits} 學分 · </span>
            {scoreLabel(c)}
            {c.notes ? (
              <div className="mt-1 text-xs leading-snug text-[var(--ink-muted)]">{c.notes}</div>
            ) : null}
          </li>
        ))}
      </ul>
      {needToggle ? (
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border-2 border-[var(--brand)]/55 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-deep)] shadow-sm transition hover:bg-[var(--brand-soft)]"
          onClick={() => setExpanded((v) => !v)}
        >
          <span aria-hidden className="text-sm leading-none">
            {expanded ? "↑" : "↓"}
          </span>
          {expanded ? "向上收起" : `向下展開（另 ${courses.length - 4} 筆）`}
        </button>
      ) : null}
    </div>
  );
}

function DomainTrackPanel({ track }: { track: DomainTrack }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        track.met
          ? "border-[var(--brand)]/35 bg-white/70"
          : "border-[#c4a4a4]/50 bg-[#f7f0f0]/70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-[var(--brand-deep)]">{track.title}</div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{track.rule}</p>
        </div>
        <div className="text-sm font-medium">
          領域 {track.coveredCount}/{track.requiredDomains}
          {track.minCredits != null ? ` · 學分 ${track.earnedCredits}/${track.minCredits}` : ""}
          <span className={`ml-2 ${track.met ? "text-[#5f8f78]" : "text-[#a87878]"}`}>
            {track.met ? "已符合" : "尚未符合"}
          </span>
        </div>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {track.domains.map((d) => (
          <li
            key={d.id}
            className={`rounded-xl px-3 py-2 text-sm ${
              d.covered ? "bg-[#e6efe9] text-[var(--brand-deep)]" : "bg-white/80 text-[var(--ink-muted)]"
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${
                  d.covered ? "bg-[#7a9e8a]" : "bg-[#c4a4a4]"
                }`}
              >
                {d.covered ? "✓" : "✕"}
              </span>
              {d.name}
            </div>
            {d.courses.length > 0 ? (
              <div className="mt-1 text-xs leading-snug opacity-80">{d.courses.join("、")}</div>
            ) : (
              <div className="mt-1 text-xs opacity-70">尚未修習</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HandbookLinks({ handbook }: { handbook: CreditsHandbook }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-sm">
      <a
        className="rounded-full border border-[var(--brand)]/40 bg-white px-3 py-1 font-medium text-[var(--brand-deep)] hover:bg-[var(--brand-soft)]"
        href={handbook.browseUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        瀏覽{handbook.label}
      </a>
      <a
        className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[var(--ink)] hover:bg-[var(--bg-accent)]"
        href={handbook.downloadUrl}
        download={handbook.downloadName}
      >
        下載手冊
      </a>
    </span>
  );
}

export function CreditsClient({
  programs,
  waiveFree,
}: {
  programs: CreditsProgramView[];
  waiveFree: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          學分明細
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          選修僅列出已修／修習中；必修科目完整列出。成績達 60 分始計入已修學分。
        </p>
        {waiveFree ? (
          <p className="mt-2 text-sm text-[var(--brand)]">
            已同時勾選大學部與教育學程：自由選修免修，不列入畢業條件。
          </p>
        ) : null}
      </div>

      {programs.map((program) => (
        <section key={program.id} className="card space-y-5 p-6">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-xl font-bold text-[var(--brand-deep)]">{program.name}</h2>
              {program.handbook ? <HandbookLinks handbook={program.handbook} /> : null}
            </div>
            {program.description ? (
              <p className="mt-1 text-sm text-[var(--ink-muted)]">{program.description}</p>
            ) : null}
            <p className="mt-2 text-sm">
              總應修約 {program.totalRequired ?? "—"} 學分｜已修畢 {program.earnedCredits} 學分
            </p>
          </div>

          {program.domainTracks && program.domainTracks.length > 0 ? (
            <div className="space-y-3">
              <div className="font-semibold text-[var(--brand-deep)]">手冊領域條件檢核</div>
              {program.domainTracks.map((t) => (
                <DomainTrackPanel key={t.id} track={t} />
              ))}
            </div>
          ) : null}

          {program.nonCredits.length > 0 ? (
            <div className="rounded-2xl border border-[var(--brand)]/25 bg-white/60 p-4">
              <div className="font-semibold text-[var(--brand-deep)]">非學分條件（含小黃卡）</div>
              <ul className="mt-3 space-y-2 text-sm">
                {program.nonCredits.map((n) => (
                  <li key={n.code} className="rounded-xl bg-[var(--bg-accent)] px-3 py-2">
                    <div className="font-medium">{n.name}</div>
                    {n.description ? (
                      <div className="mt-0.5 text-[var(--ink-muted)]">{n.description}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {program.groups.map((g) => (
            <div key={g.code} className="rounded-2xl bg-[var(--bg-accent)] p-4">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <div className="font-semibold">{g.name}</div>
                  <div className="text-sm text-[var(--ink-muted)]">
                    {g.minCredits > 0 ? `最低 ${g.minCredits} 學分` : "無最低學分門檻"}
                  </div>
                  {g.description ? (
                    <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[var(--ink-muted)]">
                      {g.description}
                    </p>
                  ) : null}
                </div>
                <div className="text-sm">
                  {g.earnedCredits}/{g.minCredits || "—"}
                  {g.plannedCredits > 0 ? ` · 規劃中 +${g.plannedCredits}` : ""}
                </div>
              </div>
              <ProgressBar value={g.percent} />
              <CourseList courses={g.courses} />
            </div>
          ))}
        </section>
      ))}

      {programs.length === 0 ? (
        <div className="card p-5 text-sm text-[var(--ink-muted)]">
          請先至設定勾選學制／教育學程，或新增修課紀錄。
        </div>
      ) : null}
    </div>
  );
}
