import Link from "next/link";
import { ProgressBar, StatCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import {
  failedEnrollments,
  freeElectivePolicyNote,
  shouldWaiveFreeElective,
} from "@/lib/graduationRules";
import {
  computeProgramProgress,
  resolveProgram,
  weightedAverage,
  weightedGpa,
  type EnrollmentLike,
} from "@/lib/progress";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);
  const enrollments = profile.enrollments as EnrollmentLike[];

  const selectedCodes = profile.selectedPrograms.map((sp) => sp.program.code);
  const enrollmentCodes = Array.from(
    new Set(enrollments.map((e) => resolveProgram(e)).filter((c) => c && c !== "UNKNOWN"))
  ) as string[];

  // 以設定勾選的學制／教育學程為準，確保全部顯示進度
  const programCodes = selectedCodes.length > 0 ? selectedCodes : enrollmentCodes;
  const waiveFree = shouldWaiveFreeElective(selectedCodes);
  const freeNote = freeElectivePolicyNote(profile.entryYear);
  const failed = failedEnrollments(enrollments);

  const fullPrograms =
    programCodes.length === 0
      ? []
      : await prisma.program.findMany({
          where: { code: { in: programCodes } },
          include: {
            groups: { orderBy: { sortOrder: "asc" } },
            nonCredits: { orderBy: { sortOrder: "asc" } },
          },
          orderBy: { sortOrder: "asc" },
        });

  const progresses = fullPrograms.map((p) =>
    computeProgramProgress(p, enrollments, { waiveFreeElective: waiveFree })
  );

  const avg = weightedAverage(enrollments, {
    includeFail: profile.includeFailInAvg,
  });
  const gpa = weightedGpa(enrollments, {
    includeFail: profile.includeFailInAvg,
  });

  const planned = enrollments.filter((e) => e.status === "planned").length;
  const needsSetup = profile.selectedPrograms.length === 0;
  const orphanCount = enrollments.filter((e) => resolveProgram(e) === "UNKNOWN").length;

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          你好，{profile.displayName || user.name || "同學"}
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          入學 {profile.entryYear} 學年｜目前 {profile.currentGrade} 年級｜目前學期{" "}
          {profile.currentTerm}
          {profile.expectedGradYear ? `｜預計 ${profile.expectedGradYear} 學年畢業` : ""}
          ｜已修學分以成績達 60 分為準
        </p>
      </div>

      {needsSetup ? (
        <div className="card border-[var(--warn)] bg-[#fff7ed] p-5">
          <div className="font-semibold text-[var(--warn)]">先完成學制設定</div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            請到設定頁勾選大學部、碩班或教育學程，系統才能正確歸類學分。
          </p>
          <Link href="/app/settings" className="btn btn-primary mt-4">
            前往設定
          </Link>
        </div>
      ) : null}

      {orphanCount > 0 ? (
        <div className="card border-[var(--warn)] bg-[#fff7ed] p-4 text-sm text-[var(--warn)]">
          有 {orphanCount} 筆修課紀錄尚未對應學制，請至「修課紀錄」或「成績」更正類別／學制。
        </div>
      ) : null}

      {failed.length > 0 ? (
        <div className="card border-[var(--danger)] bg-[#fef2f2] p-5">
          <div className="font-semibold text-[var(--danger)]">未達 60 分｜請記得重修</div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            下列科目未達及格標準，不計入已修學分。
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {failed.map((f, i) => (
              <li key={`${f.label}-${f.term}-${i}`} className="font-medium text-[var(--danger)]">
                {f.label}
                <span className="font-normal text-[var(--ink-muted)]">
                  {" "}
                  · {f.term} · {f.credits} 學分
                </span>
                {f.score != null ? ` · ${f.score} 分` : ""}
                <span> — 請安排重修</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {waiveFree || selectedCodes.includes("UNDERGRAD") ? (
        <div className="card border-[var(--brand)]/30 bg-[var(--bg-accent)] p-5">
          <div className="font-semibold text-[var(--brand-deep)]">{freeNote.title}</div>
          {waiveFree ? (
            <p className="mt-2 text-sm text-[var(--brand)]">
              目前已同時勾選大學部與教育學程：自由選修免修，已修自由選修不列入畢業條件。
            </p>
          ) : null}
          <p className="mt-2 text-sm text-[var(--ink-muted)]">{freeNote.body}</p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--ink-muted)]">
            {freeNote.detail.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="已登錄科目" value={String(enrollments.length)} />
        <StatCard label="計畫中科目" value={String(planned)} hint="可在學期規劃調整" />
        <StatCard
          label="加權平均"
          value={avg.average != null ? String(avg.average) : "—"}
          hint={`計入 ${avg.credits} 學分`}
        />
        <StatCard
          label="GPA (4.0)"
          value={gpa.gpa4 != null ? String(gpa.gpa4) : "—"}
          hint="百分制換算"
        />
        <StatCard
          label="GPA (4.3)"
          value={gpa.gpa43 != null ? String(gpa.gpa43) : "—"}
          hint="百分制換算"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-[var(--brand-deep)]">學制進度</h2>
          <Link href="/app/credits" className="text-sm font-medium text-[var(--brand)]">
            看學分明細 →
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {fullPrograms.map((program) => {
            const p = progresses.find((x) => x.programCode === program.code)!;
            const nonCredits = program.nonCredits;
            return (
              <div key={program.code} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{p.programName}</div>
                    <div className="mt-1 text-sm text-[var(--ink-muted)]">
                      已修畢 {p.earnedCredits} 學分
                      {p.totalRequired != null ? `／應修約 ${p.totalRequired}` : ""}
                      {p.plannedCredits > 0 ? `（另規劃 ${p.plannedCredits}）` : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {p.groups.map((g) => (
                    <div key={g.code}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{g.name}</span>
                        <span className="text-[var(--ink-muted)]">
                          {g.earnedCredits}/{g.minCredits || "—"}
                          {g.minCredits > 0 && g.remaining > 0
                            ? `（差 ${g.remaining}）`
                            : g.minCredits > 0
                              ? " ✓"
                              : g.code === "FREE" && waiveFree
                                ? "（免修）"
                                : ""}
                        </span>
                      </div>
                      <ProgressBar value={g.percent} />
                    </div>
                  ))}
                </div>
                {nonCredits.length > 0 ? (
                  <div className="mt-4 border-t border-[var(--line)] pt-3">
                    <div className="mb-2 text-sm font-semibold text-[var(--brand-deep)]">
                      非學分條件
                      {nonCredits.some((n) => n.code === "YELLOW") ? "（含小黃卡）" : ""}
                    </div>
                    <ul className="space-y-1.5 text-sm text-[var(--ink-muted)]">
                      {nonCredits.map((n) => (
                        <li key={n.code}>
                          <span className="font-medium text-[var(--ink)]">{n.name}</span>
                          {n.description ? ` — ${n.description}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
          {progresses.length === 0 ? (
            <div className="card p-5 text-sm text-[var(--ink-muted)]">
              尚無學制進度，請先至設定勾選學制／教育學程。
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/app/schedule", title: "課表", desc: "自建每週課表，依學期切換查看" },
          { href: "/app/lookup", title: "課程類別查詢", desc: "輸入課名查出學制與所屬類別路徑" },
          { href: "/app/plan", title: "學期規劃", desc: "把缺口排進未來學期，預估達標時間" },
          { href: "/app/grades", title: "上傳成績單", desc: "PDF 匯入後看總平均與分類平均" },
          { href: "/app/requirements", title: "條件／擋修", desc: "畢業條件與先修關係" },
          { href: "/app/settings", title: "顏色與學制", desc: "自選系統顏色並設定修習學程" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card block p-5 transition hover:-translate-y-0.5">
            <div className="font-semibold text-[var(--brand-deep)]">{item.title}</div>
            <div className="mt-2 text-sm text-[var(--ink-muted)]">{item.desc}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
