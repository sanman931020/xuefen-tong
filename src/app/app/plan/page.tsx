import { PlanClient } from "@/components/PlanClient";
import { prisma } from "@/lib/prisma";
import { courseCode, courseLabel } from "@/lib/progress";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function PlanPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);
  const selectedIds = profile.selectedPrograms.map((s) => s.programId);

  const courses = await prisma.course.findMany({
    where: selectedIds.length ? { programId: { in: selectedIds } } : undefined,
    include: { program: true, group: true },
    orderBy: [{ programId: "asc" }, { code: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          學期規劃
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          把未來要修的課排進各學期，修完後可一鍵改為已修並計入進度。
        </p>
      </div>

      <PlanClient
        currentTerm={profile.currentTerm}
        enrollments={profile.enrollments.map((e) => ({
          id: e.id,
          term: e.term,
          status: e.status,
          credits: e.credits,
          score: e.score,
          label: courseLabel(e),
          code: courseCode(e),
          categoryCode: e.categoryCode,
          programCode: e.programCode,
        }))}
        courses={courses.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          programCode: c.program.code,
          groupCode: c.group?.code || null,
        }))}
      />
    </div>
  );
}
