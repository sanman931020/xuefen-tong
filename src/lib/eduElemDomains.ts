import { courseLabel, isPassed, resolveCategory, resolveProgram, type EnrollmentLike } from "@/lib/progress";

export type DomainChip = {
  id: string;
  name: string;
  covered: boolean;
  /** 已計入該領域的科目名稱 */
  courses: string[];
};

export type DomainTrack = {
  id: string;
  title: string;
  rule: string;
  requiredDomains: number;
  coveredCount: number;
  minCredits: number | null;
  earnedCredits: number;
  domains: DomainChip[];
  domainsMet: boolean;
  creditsMet: boolean;
  met: boolean;
};

type CatalogLike = {
  code: string;
  name: string;
  credits: number;
  notes: string | null;
};

/** 教育實踐｜7 領域教材教法（至少修 4 領域） */
const PRACTICE_DOMAINS: { id: string; name: string; codes: string[] }[] = [
  { id: "lang", name: "語文", codes: ["TE-P02", "TE-P03", "TE-P04"] },
  { id: "math", name: "數學", codes: ["TE-P05"] },
  { id: "nature", name: "自然科學", codes: ["TE-P06"] },
  { id: "social", name: "社會", codes: ["TE-P07"] },
  { id: "arts", name: "藝術", codes: ["TE-P08"] },
  { id: "pe", name: "健康與體育", codes: ["TE-P09"] },
  { id: "integrated", name: "綜合活動", codes: ["TE-P10"] },
];

/** 專門課程｜教學基本學科領域（至少 4 領域 10 學分） */
const SPECIAL_DOMAINS: { id: string; name: string; notePattern: RegExp }[] = [
  { id: "lang", name: "語文", notePattern: /語文領域/ },
  { id: "math", name: "數學", notePattern: /數學領域/ },
  { id: "nature", name: "自然科學", notePattern: /自然科學領域/ },
  { id: "social", name: "社會", notePattern: /社會領域/ },
  { id: "pe", name: "健康與體育", notePattern: /健康與體育領域/ },
  { id: "arts", name: "藝術", notePattern: /藝術領域/ },
  { id: "integrated", name: "綜合活動", notePattern: /綜合活動領域/ },
  { id: "cross", name: "跨領域", notePattern: /跨領域/ },
];

function countsTowardDomain(e: EnrollmentLike) {
  // 已修畢（≥60／抵免）或修習中，皆可顯示為「已涵蓋」；規劃中不計
  if (e.status === "planned" || e.status === "failed") return false;
  if (e.status === "in_progress" || e.status === "transferred") return true;
  if (e.status === "taken") {
    if (e.score == null) return true; // 成績未到仍視為已修該科
    return e.score >= 60;
  }
  return false;
}

function matchEnrollment(
  enrollments: EnrollmentLike[],
  catalog: CatalogLike,
  programCode: string
) {
  return enrollments.find((e) => {
    if (resolveProgram(e) !== programCode) return false;
    if (!countsTowardDomain(e)) return false;
    const code = e.course?.code || e.customCode;
    if (code === catalog.code) return true;
    if (courseLabel(e) === catalog.name) return true;
    return false;
  });
}

function buildPracticeTrack(
  catalog: CatalogLike[],
  enrollments: EnrollmentLike[],
  programCode: string
): DomainTrack {
  const domains: DomainChip[] = PRACTICE_DOMAINS.map((d) => {
    const related = catalog.filter((c) => d.codes.includes(c.code));
    const hitCourses: string[] = [];
    for (const c of related) {
      if (matchEnrollment(enrollments, c, programCode)) hitCourses.push(c.name);
    }
    return {
      id: d.id,
      name: d.name,
      covered: hitCourses.length > 0,
      courses: hitCourses,
    };
  });

  const coveredCount = domains.filter((d) => d.covered).length;
  const requiredDomains = 4;
  const domainsMet = coveredCount >= requiredDomains;

  return {
    id: "practice-methods",
    title: "教材教法領域",
    rule: "7 個領域教材教法至少修 4 領域（國語、數學教材教法為必修）",
    requiredDomains,
    coveredCount,
    minCredits: null,
    earnedCredits: 0,
    domains,
    domainsMet,
    creditsMet: true,
    met: domainsMet,
  };
}

function buildSpecialTrack(
  catalog: CatalogLike[],
  enrollments: EnrollmentLike[],
  programCode: string
): DomainTrack {
  const specialCatalog = catalog.filter((c) =>
    SPECIAL_DOMAINS.some((d) => c.notes && d.notePattern.test(c.notes))
  );

  const domains: DomainChip[] = SPECIAL_DOMAINS.map((d) => {
    const related = specialCatalog.filter((c) => c.notes && d.notePattern.test(c.notes));
    const hitCourses: string[] = [];
    for (const c of related) {
      if (matchEnrollment(enrollments, c, programCode)) hitCourses.push(c.name);
    }
    return {
      id: d.id,
      name: d.name,
      covered: hitCourses.length > 0,
      courses: hitCourses,
    };
  });

  const earnedCredits = enrollments
    .filter((e) => {
      if (resolveProgram(e) !== programCode) return false;
      if (resolveCategory(e) !== "ED_SPECIAL") return false;
      return isPassed(e);
    })
    .reduce((s, e) => s + e.credits, 0);

  const coveredCount = domains.filter((d) => d.covered).length;
  const requiredDomains = 4;
  const minCredits = 10;
  const domainsMet = coveredCount >= requiredDomains;
  const creditsMet = earnedCredits >= minCredits;

  return {
    id: "special-domains",
    title: "專門課程領域",
    rule: "至少修習 4 個領域、合計 10 學分（國音及說話、普通數學為必修）",
    requiredDomains,
    coveredCount,
    minCredits,
    earnedCredits,
    domains,
    domainsMet,
    creditsMet,
    met: domainsMet && creditsMet,
  };
}

/** 國民小學教育學程：教材教法 4／7 領域＋專門課程 4 領域 10 學分 */
export function computeEduElemDomainTracks(
  courses: CatalogLike[],
  enrollments: EnrollmentLike[],
  programCode = "EDU_ELEM"
): DomainTrack[] {
  if (programCode !== "EDU_ELEM") return [];
  const practiceCatalog = courses.filter((c) =>
    PRACTICE_DOMAINS.some((d) => d.codes.includes(c.code))
  );
  const specialCatalog = courses.filter(
    (c) => c.notes && SPECIAL_DOMAINS.some((d) => d.notePattern.test(c.notes!))
  );
  return [
    buildPracticeTrack(practiceCatalog, enrollments, programCode),
    buildSpecialTrack(specialCatalog, enrollments, programCode),
  ];
}

/** 自備註解析領域標籤（顯示用） */
export function domainLabelFromNotes(notes: string | null | undefined) {
  if (!notes) return null;
  const m = notes.match(
    /(語文領域|數學領域|自然科學領域|社會領域|健康與體育領域|藝術領域|綜合活動領域|跨領域)/
  );
  return m?.[1] ?? null;
}
