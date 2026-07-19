import { CoursesClient } from "@/components/CoursesClient";
import { prisma } from "@/lib/prisma";
import { courseLabel, resolveCategory } from "@/lib/progress";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function CoursesPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);

  const courses = await prisma.course.findMany({
    include: { program: true, group: true },
    orderBy: [{ program: { sortOrder: "asc" } }, { code: "asc" }],
  });

  const groups = await prisma.requirementGroup.findMany({
    include: { program: true },
    orderBy: [{ program: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const groupName = new Map(groups.map((g) => [`${g.program.code}:${g.code}`, g.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          修課紀錄
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          先選學制與類別再選科目。校共同科目含通識（共同必修／分類選修／共同選修）與體育；分類選修與體育請用手動輸入實際課名。
        </p>
      </div>
      <CoursesClient
        currentTerm={profile.currentTerm}
        groups={groups.map((g) => ({
          programCode: g.program.code,
          code: g.code,
          name: g.name,
          blockName: g.blockName,
        }))}
        courses={courses.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          programCode: c.program.code,
          programLabel: c.program.shortLabel || c.program.name,
          groupCode: c.group?.code || null,
          groupName: c.group?.name || null,
        }))}
        enrollments={profile.enrollments.map((e) => {
          const cat = resolveCategory(e);
          const prog =
            e.programCode || e.course?.program?.code || "";
          return {
            id: e.id,
            label: courseLabel(e),
            term: e.term,
            status: e.status,
            credits: e.credits,
            score: e.score,
            categoryName: groupName.get(`${prog}:${cat}`) || (cat === "UNCATEGORIZED" ? null : cat),
          };
        })}
      />
    </div>
  );
}
