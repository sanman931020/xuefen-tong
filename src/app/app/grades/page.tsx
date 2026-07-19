import { GradesClient } from "@/components/GradesClient";
import { prisma } from "@/lib/prisma";
import {
  courseLabel,
  resolveCategory,
  resolveProgram,
  weightedAverage,
  weightedGpa,
} from "@/lib/progress";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function GradesPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);

  const overallAvg = weightedAverage(profile.enrollments, {
    includeFail: profile.includeFailInAvg,
  });
  const overallGpa = weightedGpa(profile.enrollments, {
    includeFail: profile.includeFailInAvg,
  });

  const groups = await prisma.requirementGroup.findMany({
    include: { program: true },
  });
  const groupName = new Map(groups.map((g) => [`${g.program.code}:${g.code}`, g.name]));
  const programs = await prisma.program.findMany();
  const programName = new Map(programs.map((p) => [p.code, p.name]));

  const categoryCodes = Array.from(
    new Set(profile.enrollments.map((e) => resolveCategory(e)).filter((c) => c !== "UNCATEGORIZED"))
  );
  const programCodes = Array.from(
    new Set(profile.enrollments.map((e) => resolveProgram(e)).filter((c) => c !== "UNKNOWN"))
  );

  const categoryStats = categoryCodes.map((code) => {
    const sample = profile.enrollments.find((e) => resolveCategory(e) === code);
    const prog = sample ? resolveProgram(sample) : "";
    const avg = weightedAverage(profile.enrollments, {
      includeFail: profile.includeFailInAvg,
      categoryCode: code,
    });
    return {
      code,
      name: groupName.get(`${prog}:${code}`) || code,
      average: avg.average,
      credits: avg.credits,
    };
  });

  const programStats = programCodes.map((code) => {
    const avg = weightedAverage(profile.enrollments, {
      includeFail: profile.includeFailInAvg,
      programCode: code,
    });
    return {
      code,
      name: programName.get(code) || code,
      average: avg.average,
      credits: avg.credits,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          成績平均
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          上傳成績單後可看總平均，並依學制／類科分開統計。未達 60 分會以紅色標示。
        </p>
      </div>
      <GradesClient
        overallAvg={overallAvg.average}
        overallGpa4={overallGpa.gpa4}
        overallGpa43={overallGpa.gpa43}
        categoryStats={categoryStats}
        programStats={programStats}
        enrollments={profile.enrollments.map((e) => ({
          id: e.id,
          term: e.term,
          name: courseLabel(e),
          credits: e.credits,
          score: e.score,
          status: e.status,
        }))}
      />
    </div>
  );
}
