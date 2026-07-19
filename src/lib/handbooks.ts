/** 各學制／學程對應的課程手冊（public/handbooks） */
export type HandbookLink = {
  label: string;
  /** 瀏覽器內開啟（PDF／文字） */
  browseUrl: string;
  /** 下載原始檔 */
  downloadUrl: string;
  downloadName: string;
};

const TEACHER: HandbookLink = {
  label: "113學年度師資生手冊",
  browseUrl: "/handbooks/teacher-113.pdf",
  downloadUrl: "/handbooks/teacher-113.pdf",
  downloadName: "113學年度師資生手冊.pdf",
};

const UNDERGRAD: HandbookLink = {
  label: "大學部課程手冊",
  browseUrl: "/handbooks/undergrad.txt",
  downloadUrl: "/handbooks/undergrad.docx",
  downloadName: "大學部課程手冊.docx",
};

const MASTER: HandbookLink = {
  label: "碩班課程手冊",
  browseUrl: "/handbooks/master.txt",
  downloadUrl: "/handbooks/master.docx",
  downloadName: "碩班課程手冊.docx",
};

const BY_PROGRAM: Record<string, HandbookLink> = {
  UNDERGRAD,
  MASTER,
  EDU_ELEM: TEACHER,
  EDU_SPED: TEACHER,
  EDU_ECE: TEACHER,
};

export function handbookForProgram(programCode: string): HandbookLink | null {
  return BY_PROGRAM[programCode] ?? null;
}
