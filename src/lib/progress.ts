export type EnrollmentLike = {
  credits: number;
  status: string;
  score: number | null;
  countInAvg: boolean;
  categoryCode: string | null;
  programCode: string | null;
  term: string;
  courseId: string | null;
  customName: string | null;
  customCode: string | null;
  course?: {
    id: string;
    code: string;
    name: string;
    credits: number;
    group?: { code: string; name: string } | null;
    program?: { code: string; name: string } | null;
  } | null;
};

export type GroupProgress = {
  code: string;
  name: string;
  minCredits: number;
  earnedCredits: number;
  plannedCredits: number;
  remaining: number;
  percent: number;
};

export type ProgramProgress = {
  programCode: string;
  programName: string;
  totalRequired: number | null;
  earnedCredits: number;
  plannedCredits: number;
  groups: GroupProgress[];
};

const PLANNED = new Set(["planned"]);

export function isPassed(e: EnrollmentLike) {
  if (e.status === "failed" || e.status === "planned" || e.status === "in_progress") {
    return false;
  }
  if (e.status === "transferred") return true;
  // 成績達 60 分才算修畢；無成績不計入已修學分
  if (e.score != null) return e.score >= 60;
  return false;
}

/** 不及格或未達 60：應重修提醒 */
export function isFailedScore(e: EnrollmentLike) {
  if (e.status === "failed") return true;
  if (e.score != null && e.score < 60) return true;
  return false;
}

export function courseLabel(e: EnrollmentLike) {
  return e.customName || e.course?.name || "未命名科目";
}

export function courseCode(e: EnrollmentLike) {
  return e.customCode || e.course?.code || "";
}

export function resolveCategory(e: EnrollmentLike) {
  return e.categoryCode || e.course?.group?.code || "UNCATEGORIZED";
}

export function resolveProgram(e: EnrollmentLike) {
  return e.programCode || e.course?.program?.code || "UNKNOWN";
}

export function computeProgramProgress(
  program: {
    code: string;
    name: string;
    totalCredits: number | null;
    groups: { code: string; name: string; minCredits: number }[];
  },
  enrollments: EnrollmentLike[],
  options?: {
    /** 免修自由選修：門檻歸零，且已修自由選修不計入畢業進度 */
    waiveFreeElective?: boolean;
  }
): ProgramProgress {
  const waiveFree = Boolean(options?.waiveFreeElective) && program.code === "UNDERGRAD";
  const related = enrollments.filter((e) => resolveProgram(e) === program.code);

  const groups = program.groups.map((g) => {
    const waived = waiveFree && g.code === "FREE";
    const minCredits = waived ? 0 : g.minCredits;
    const inGroup = related.filter((e) => resolveCategory(e) === g.code);
    // 僅成績≥60（或抵免）計入已修；不及格不計
    const earnedCredits = waived
      ? 0
      : inGroup.filter(isPassed).reduce((s, e) => s + e.credits, 0);
    const plannedCredits = inGroup
      .filter((e) => PLANNED.has(e.status))
      .reduce((s, e) => s + e.credits, 0);
    const remaining = Math.max(0, minCredits - earnedCredits);
    const percent =
      minCredits <= 0
        ? waived
          ? 100
          : earnedCredits > 0
            ? 100
            : 0
        : Math.min(100, Math.round((earnedCredits / minCredits) * 100));

    return {
      code: g.code,
      name: waived ? `${g.name}（免修｜不列入畢業條件）` : g.name,
      minCredits,
      earnedCredits,
      plannedCredits,
      remaining,
      percent,
    };
  });

  // 有掛在此學制但類別對不到規則群組的科目 → 顯示為未歸類，避免進度漏算
  const uncategorized = related.filter((e) => {
    const cat = resolveCategory(e);
    return cat === "UNCATEGORIZED" || !program.groups.some((g) => g.code === cat);
  });
  if (uncategorized.length > 0) {
    const earnedCredits = uncategorized.filter(isPassed).reduce((s, e) => s + e.credits, 0);
    const plannedCredits = uncategorized
      .filter((e) => PLANNED.has(e.status))
      .reduce((s, e) => s + e.credits, 0);
    groups.push({
      code: "UNCATEGORIZED",
      name: "未歸類（請至修課紀錄／成績更正類別）",
      minCredits: 0,
      earnedCredits,
      plannedCredits,
      remaining: 0,
      percent: earnedCredits > 0 ? 100 : 0,
    });
  }

  const earnedCredits = groups.reduce((s, g) => s + g.earnedCredits, 0);
  const plannedCredits = related
    .filter((e) => PLANNED.has(e.status))
    .reduce((s, e) => s + e.credits, 0);

  const baseTotal = program.totalCredits;
  const totalRequired =
    waiveFree && baseTotal != null ? Math.max(0, baseTotal - 15) : baseTotal;

  return {
    programCode: program.code,
    programName: program.name,
    totalRequired,
    earnedCredits,
    plannedCredits,
    groups,
  };
}

export function weightedAverage(
  enrollments: EnrollmentLike[],
  options?: { includeFail?: boolean; categoryCode?: string; programCode?: string }
) {
  let list = enrollments.filter(
    (e) => e.countInAvg && e.score != null && (e.status === "taken" || e.status === "failed")
  );

  if (options?.includeFail === false) {
    list = list.filter((e) => e.status !== "failed" && (e.score as number) >= 60);
  }
  if (options?.categoryCode) {
    list = list.filter((e) => resolveCategory(e) === options.categoryCode);
  }
  if (options?.programCode) {
    list = list.filter((e) => resolveProgram(e) === options.programCode);
  }

  const totalCredits = list.reduce((s, e) => s + e.credits, 0);
  if (totalCredits === 0) {
    return { average: null as number | null, credits: 0, count: 0 };
  }

  const sum = list.reduce((s, e) => s + (e.score as number) * e.credits, 0);
  return {
    average: Math.round((sum / totalCredits) * 100) / 100,
    credits: totalCredits,
    count: list.length,
  };
}

export function toGpa4(score: number) {
  if (score >= 90) return 4.0;
  if (score >= 80) return 3.0;
  if (score >= 70) return 2.0;
  if (score >= 60) return 1.0;
  return 0;
}

/** 常見臺灣大學 4.3 制換算 */
export function toGpa43(score: number) {
  if (score >= 90) return 4.3;
  if (score >= 85) return 4.0;
  if (score >= 80) return 3.7;
  if (score >= 77) return 3.3;
  if (score >= 73) return 3.0;
  if (score >= 70) return 2.7;
  if (score >= 67) return 2.3;
  if (score >= 63) return 2.0;
  if (score >= 60) return 1.7;
  return 0;
}

function filterForGpa(
  enrollments: EnrollmentLike[],
  options?: { includeFail?: boolean; categoryCode?: string; programCode?: string }
) {
  let list = enrollments.filter(
    (e) => e.countInAvg && e.score != null && (e.status === "taken" || e.status === "failed")
  );
  if (options?.includeFail === false) {
    list = list.filter((e) => e.status !== "failed" && (e.score as number) >= 60);
  }
  if (options?.categoryCode) {
    list = list.filter((e) => resolveCategory(e) === options.categoryCode);
  }
  if (options?.programCode) {
    list = list.filter((e) => resolveProgram(e) === options.programCode);
  }
  return list;
}

export function weightedGpa(
  enrollments: EnrollmentLike[],
  options?: { includeFail?: boolean; categoryCode?: string; programCode?: string }
) {
  const list = filterForGpa(enrollments, options);
  const totalCredits = list.reduce((s, e) => s + e.credits, 0);
  if (totalCredits === 0) {
    return {
      gpa: null as number | null,
      gpa4: null as number | null,
      gpa43: null as number | null,
      credits: 0,
      count: 0,
    };
  }

  const sum4 = list.reduce((s, e) => s + toGpa4(e.score as number) * e.credits, 0);
  const sum43 = list.reduce((s, e) => s + toGpa43(e.score as number) * e.credits, 0);
  const gpa4 = Math.round((sum4 / totalCredits) * 100) / 100;
  const gpa43 = Math.round((sum43 / totalCredits) * 100) / 100;

  return {
    gpa: gpa4,
    gpa4,
    gpa43,
    credits: totalCredits,
    count: list.length,
  };
}
