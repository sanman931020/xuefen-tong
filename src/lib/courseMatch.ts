import { prisma } from "@/lib/prisma";
import type { EnrollmentLike } from "@/lib/progress";

export type CatalogCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  programCode: string;
  groupCode: string | null;
  groupName: string | null;
};

function normalizeName(name: string) {
  return name
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[▲◇※◎§╳]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

/** 代碼比對時忽略連字號差異（GE-CN1 ≈ GECN1） */
function normalizeCode(code: string) {
  return code.replace(/-/g, "").trim().toLowerCase();
}

export async function loadCatalogCourses(): Promise<CatalogCourse[]> {
  const courses = await prisma.course.findMany({
    include: { program: true, group: true },
  });
  return courses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    credits: c.credits,
    programCode: c.program.code,
    groupCode: c.group?.code || null,
    groupName: c.group?.name || null,
  }));
}

/** 依代碼／課名對到手冊科目（精確優先） */
export function matchCatalogCourse(
  catalog: CatalogCourse[],
  opts: {
    code?: string | null;
    name?: string | null;
    preferProgramCodes?: string[];
  }
): CatalogCourse | null {
  const code = normalizeCode(opts.code || "");
  const rawName = (opts.name || "").trim();
  const name = normalizeName(rawName);
  if (!code && !name) return null;

  const prefer = new Set(opts.preferProgramCodes || []);

  const rank = (c: CatalogCourse) => {
    let score = 0;
    if (prefer.has(c.programCode)) score += 10;
    if (code && normalizeCode(c.code) === code) score += 100;
    const cn = normalizeName(c.name);
    if (name && cn === name) score += 80;
    else if (
      name &&
      (cn.includes(name) || name.includes(cn)) &&
      Math.min(cn.length, name.length) >= 2
    ) {
      score += 40;
    }
    return score;
  };

  let best: CatalogCourse | null = null;
  let bestScore = 0;
  for (const c of catalog) {
    const s = rank(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  // 至少要有代碼命中或名稱高度相似
  if (bestScore < 40) return null;
  return best;
}

/** 舊版「GENERAL」一籃子 → 對應新通識細類 */
function remapLegacyGeneralCategory(
  e: EnrollmentLike,
  matched: CatalogCourse | null
): string | null {
  const cat = e.categoryCode;
  if (cat && cat !== "GENERAL") return cat;

  if (matched?.groupCode?.startsWith("GE_")) return matched.groupCode;

  const name = normalizeName(e.customName || e.course?.name || "");
  const code = normalizeCode(e.customCode || e.course?.code || "");
  if (
    code.startsWith("gecn") ||
    code.startsWith("geen") ||
    name.includes("國文") ||
    name.includes("英文")
  ) {
    return "GE_CORE";
  }
  if (name.includes("體育") || code.startsWith("gepe")) return "GE_PE";
  if (cat === "GENERAL") return "GE_ELECTIVE";
  return cat;
}

/** 補上缺失的 programCode／categoryCode，讓總覽進度能歸類 */
export function enrichEnrollment(
  e: EnrollmentLike,
  catalog: CatalogCourse[],
  preferProgramCodes?: string[]
): EnrollmentLike {
  const matched = matchCatalogCourse(catalog, {
    code: e.customCode || e.course?.code,
    name: e.customName || e.course?.name,
    preferProgramCodes:
      preferProgramCodes ||
      ([e.programCode, e.course?.program?.code].filter(Boolean) as string[]),
  });

  const remappedCategory = remapLegacyGeneralCategory(e, matched);

  if (!matched) {
    return {
      ...e,
      programCode: e.programCode || e.course?.program?.code || null,
      categoryCode: remappedCategory || e.course?.group?.code || null,
    };
  }

  const inputCode = normalizeCode(e.customCode || e.course?.code || "");
  const exactCode = Boolean(inputCode && inputCode === normalizeCode(matched.code));
  const hasProgram = Boolean(e.programCode && e.programCode !== "UNKNOWN");
  const hasCategory = Boolean(remappedCategory && remappedCategory !== "GENERAL");
  const mismatch =
    exactCode &&
    ((e.programCode && e.programCode !== matched.programCode) ||
      (remappedCategory &&
        matched.groupCode &&
        remappedCategory !== matched.groupCode &&
        remappedCategory !== "GENERAL"));

  if (hasProgram && hasCategory && !mismatch && remappedCategory === e.categoryCode) {
    return e;
  }

  return {
    ...e,
    programCode: !hasProgram || !hasCategory || exactCode ? matched.programCode : e.programCode,
    categoryCode:
      !hasCategory || exactCode || remappedCategory !== e.categoryCode
        ? matched.groupCode || remappedCategory
        : remappedCategory,
    courseId: e.courseId || matched.id,
    course: e.course || {
      id: matched.id,
      code: matched.code,
      name: matched.name,
      credits: matched.credits,
      group: matched.groupCode
        ? { code: matched.groupCode, name: matched.groupName || matched.groupCode }
        : null,
      program: { code: matched.programCode, name: matched.programCode },
    },
  };
}

export function enrichEnrollments(
  enrollments: EnrollmentLike[],
  catalog: CatalogCourse[],
  preferProgramCodes?: string[]
) {
  return enrollments.map((e) => enrichEnrollment(e, catalog, preferProgramCodes));
}
