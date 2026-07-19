import { prisma } from "@/lib/prisma";
import { courseCode, isPassed } from "@/lib/progress";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function RequirementsPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);
  const selectedIds = profile.selectedPrograms.map((s) => s.programId);

  const programs = await prisma.program.findMany({
    where: selectedIds.length ? { id: { in: selectedIds } } : undefined,
    include: {
      groups: { orderBy: { sortOrder: "asc" } },
      nonCredits: { orderBy: { sortOrder: "asc" } },
      prereqs: {
        include: {
          course: true,
          requiredCourse: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const passedCodes = new Set(
    profile.enrollments
      .filter((e) => isPassed(e) || e.status === "in_progress")
      .map((e) => courseCode(e))
      .filter(Boolean)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          畢業條件／擋修
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          檢視學分門檻、非學分條件與先修關係。僅供參考，正式以學校公告為準。
        </p>
      </div>

      {programs.map((program) => (
        <section key={program.id} className="card space-y-6 p-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-deep)]">{program.name}</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{program.description}</p>
          </div>

          <div>
            <h3 className="font-semibold">學分條件重點</h3>
            <ul className="mt-3 space-y-2">
              {program.groups.map((g) => (
                <li key={g.id} className="rounded-xl bg-[var(--bg-accent)] px-4 py-3 text-sm">
                  <span className="font-medium">{g.name}</span>：至少 {g.minCredits} 學分
                  {g.description ? ` — ${g.description}` : ""}
                </li>
              ))}
              <li className="rounded-xl bg-[var(--bg-accent)] px-4 py-3 text-sm">
                <span className="font-medium">總學分</span>：約 {program.totalCredits ?? "—"} 學分
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">非學分／其他條件</h3>
            <ul className="mt-3 space-y-2">
              {program.nonCredits.map((n) => (
                <li key={n.id} className="rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3 text-sm">
                  <div className="font-medium">{n.name}</div>
                  <div className="mt-1 text-[var(--ink-muted)]">{n.description}</div>
                </li>
              ))}
              {program.nonCredits.length === 0 ? (
                <li className="text-sm text-[var(--ink-muted)]">此學制未設定額外非學分條件。</li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">擋修／先修</h3>
            <ul className="mt-3 space-y-2">
              {program.prereqs.map((p) => {
                const ok = passedCodes.has(p.requiredCourse.code);
                return (
                  <li
                    key={p.id}
                    className={`rounded-xl px-4 py-3 text-sm ${
                      ok ? "bg-[#ecfdf3] text-[#166534]" : "bg-[#fff7ed] text-[#9a3412]"
                    }`}
                  >
                    <span className="font-medium">
                      {p.course.code} {p.course.name}
                    </span>
                    {" ← 需先修 "}
                    <span className="font-medium">
                      {p.requiredCourse.code} {p.requiredCourse.name}
                    </span>
                    {ok ? "（已具備）" : "（尚未確認通過）"}
                    {p.note ? <div className="mt-1 opacity-80">{p.note}</div> : null}
                  </li>
                );
              })}
              {program.prereqs.length === 0 ? (
                <li className="text-sm text-[var(--ink-muted)]">此學制示範資料未列擋修。</li>
              ) : null}
            </ul>
          </div>
        </section>
      ))}

      <p className="text-xs text-[var(--ink-muted)]">
        已修科目對照依你的修課紀錄代碼比對：
        {Array.from(passedCodes).slice(0, 12).join("、") || "尚無"}
        {passedCodes.size > 12 ? "…" : ""}
      </p>
    </div>
  );
}
