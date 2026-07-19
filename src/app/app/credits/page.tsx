import { CreditsClient, type CreditsProgramView } from "@/components/CreditsClient";
import { computeEduElemDomainTracks, domainLabelFromNotes } from "@/lib/eduElemDomains";
import { handbookForProgram } from "@/lib/handbooks";
import { prisma } from "@/lib/prisma";
import { isEducationProgram, shouldWaiveFreeElective } from "@/lib/graduationRules";
import {
  computeProgramProgress,
  courseLabel,
  resolveCategory,
  resolveProgram,
  type EnrollmentLike,
} from "@/lib/progress";
import { getOrCreateProfile, requireUser } from "@/lib/session";

type EnrollmentRow = EnrollmentLike & { id: string };

/** 全員必修：notes 以「必修」開頭（如 必修*、必修；…）。不含「某學系必修／公費生必修」等條件式。 */
function isRequiredCourse(notes: string | null | undefined, groupCode: string) {
  if (groupCode === "MAJOR_REQ" || groupCode === "GE_CORE") return true;
  if (notes && /^必修/.test(notes.trim())) return true;
  return false;
}

function buildCourseRows(
  programCode: string,
  groupCode: string,
  catalog: { id: string; name: string; credits: number; notes: string | null }[],
  enrollments: EnrollmentRow[]
) {
  const active = enrollments.filter((e) => {
    if (resolveProgram(e) !== programCode) return false;
    if (resolveCategory(e) !== groupCode) return false;
    return (
      e.status === "taken" ||
      e.status === "in_progress" ||
      e.status === "transferred" ||
      e.status === "failed"
    );
  });

  const requiredCatalog = catalog.filter((c) => isRequiredCourse(c.notes, groupCode));
  const rows: {
    id: string;
    name: string;
    credits: number;
    score: number | null;
    status: string | null;
    required: boolean;
    domain: string | null;
    notes: string | null;
  }[] = [];
  const usedEnrollmentIds = new Set<string>();

  for (const c of requiredCatalog) {
    const match = active.find(
      (e) => !usedEnrollmentIds.has(e.id) && (e.courseId === c.id || courseLabel(e) === c.name)
    );
    if (match) {
      usedEnrollmentIds.add(match.id);
      rows.push({
        id: `req-${c.id}`,
        name: c.name,
        credits: match.credits || c.credits,
        score: match.score,
        status: match.status,
        required: true,
        domain: domainLabelFromNotes(c.notes),
        notes: c.notes,
      });
    } else {
      rows.push({
        id: `req-${c.id}`,
        name: c.name,
        credits: c.credits,
        score: null,
        status: null,
        required: true,
        domain: domainLabelFromNotes(c.notes),
        notes: c.notes,
      });
    }
  }

  for (const e of active) {
    if (usedEnrollmentIds.has(e.id)) continue;
    const name = courseLabel(e);
    if (requiredCatalog.some((c) => c.name === name)) continue;
    const cat = catalog.find((c) => c.name === name || e.courseId === c.id);
    rows.push({
      id: e.id,
      name,
      credits: e.credits,
      score: e.score,
      status: e.status,
      required: false,
      domain: domainLabelFromNotes(cat?.notes),
      notes: cat?.notes ?? null,
    });
  }

  return rows;
}

export default async function CreditsPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);
  const enrollments = profile.enrollments as EnrollmentRow[];

  const selectedCodes = profile.selectedPrograms.map((s) => s.program.code);
  const enrollmentCodes = Array.from(
    new Set(enrollments.map((e) => resolveProgram(e)).filter((c) => c && c !== "UNKNOWN"))
  ) as string[];

  const programCodes = selectedCodes.length > 0 ? selectedCodes : enrollmentCodes;
  const waiveFree = shouldWaiveFreeElective(selectedCodes);

  const programs =
    programCodes.length === 0
      ? []
      : await prisma.program.findMany({
          where: { code: { in: programCodes } },
          include: {
            groups: { orderBy: { sortOrder: "asc" } },
            courses: { include: { group: true }, orderBy: { code: "asc" } },
            nonCredits: { orderBy: { sortOrder: "asc" } },
          },
          orderBy: { sortOrder: "asc" },
        });

  const views: CreditsProgramView[] = programs.map((program) => {
    const progress = computeProgramProgress(program, enrollments, {
      waiveFreeElective: waiveFree,
    });
    const showNonCredits =
      isEducationProgram(program.code) || program.nonCredits.some((n) => n.code === "YELLOW");
    const handbook = handbookForProgram(program.code);
    const domainTracks =
      program.code === "EDU_ELEM"
        ? computeEduElemDomainTracks(
            program.courses.map((c) => ({
              code: c.code,
              name: c.name,
              credits: c.credits,
              notes: c.notes,
            })),
            enrollments,
            program.code
          )
        : [];

    return {
      id: program.id,
      code: program.code,
      name: program.name,
      description: program.description,
      totalRequired: progress.totalRequired,
      earnedCredits: progress.earnedCredits,
      handbook: handbook
        ? {
            label: handbook.label,
            browseUrl: handbook.browseUrl,
            downloadUrl: handbook.downloadUrl,
            downloadName: handbook.downloadName,
          }
        : null,
      domainTracks,
      nonCredits: showNonCredits
        ? program.nonCredits.map((n) => ({
            code: n.code,
            name: n.name,
            description: n.description,
          }))
        : [],
      groups: progress.groups.map((g) => {
        const groupMeta = program.groups.find((x) => x.code === g.code);
        const catalog = program.courses
          .filter((c) => c.group?.code === g.code)
          .map((c) => ({ id: c.id, name: c.name, credits: c.credits, notes: c.notes }));
        return {
          ...g,
          description: groupMeta?.description ?? null,
          courses: buildCourseRows(program.code, g.code, catalog, enrollments),
        };
      }),
    };
  });

  return <CreditsClient programs={views} waiveFree={waiveFree} />;
}
