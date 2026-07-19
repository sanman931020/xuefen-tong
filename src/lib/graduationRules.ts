import type { EnrollmentLike } from "@/lib/progress";
import { courseLabel, isFailedScore } from "@/lib/progress";

/** 教育學程 program code 前綴／清單 */
export const EDUCATION_PROGRAM_CODES = new Set([
  "EDU_ELEM",
  "EDU_SPED",
  "EDU_ECE",
  "EDU_SPED_GIFT",
  "EDU_SPED_SEC",
  "EDU_SPED_ECE",
  "EDU_BILINGUAL",
]);

export function isEducationProgram(code: string) {
  return EDUCATION_PROGRAM_CODES.has(code) || code.startsWith("EDU_");
}

/** 同時修大學部＋任一教育學程 → 自由選修免修 */
export function shouldWaiveFreeElective(selectedProgramCodes: string[]) {
  const hasUndergrad = selectedProgramCodes.includes("UNDERGRAD");
  const hasEdu = selectedProgramCodes.some(isEducationProgram);
  return hasUndergrad && hasEdu;
}

/** 114 學年度起入學適用新制採認說明 */
export function freeElectivePolicyNote(entryYear: number) {
  const appliesNew = entryYear >= 114;
  return {
    appliesNew,
    title: "自由選修與教育學程採認說明",
    body: appliesNew
      ? "您為 114 學年度（含）以後入學：依《臺北市立大學學生修習教育學程辦法》第八條，師資職前教育課程之「教育基礎課程」及「教育方法課程」可同時採認為系上自由選修，上限至多 15 學分。若已同時勾選大學部與任一教育學程，系統將免修自由選修門檻，已修自由選修亦不列入畢業條件。"
      : "您為 113 學年度（含）以前入學：仍須依入學當年課程規定辦理，無法適用 114 新制之自由選修採認。惟若同時勾選大學部與任一教育學程，系統仍將「免修自由選修」門檻（已修自由選修不列入畢業條件）；教育基礎／方法課程採認為自由選修請依舊規定向單位確認。",
    detail: [
      "北市大具體新規定（自 114 學年度起入學適用）",
      "依最新修正《臺北市立大學學生修習教育學程辦法》第八條：",
      "• 適用對象：自 114 學年度起入學之大學部學生。",
      "• 採認內容：師資職前教育課程中的「教育基礎課程」及「教育方法課程」可同時採認為系上自由選修。",
      "• 學分上限：採認上限至多 15 學分。",
      "• 舊生注意：113 學年度（含）以前入學者，仍須依入學當年舊課程規定辦理，無法適用本新制。",
    ],
  };
}

export function failedEnrollments(enrollments: EnrollmentLike[]) {
  return enrollments.filter(isFailedScore).map((e) => ({
    label: courseLabel(e),
    score: e.score,
    term: e.term,
    credits: e.credits,
  }));
}
