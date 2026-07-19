/** 臺北市立大學歷年成績表等 PDF／圖片解析（座標式雙欄，最多 300 筆） */

export const TRANSCRIPT_MAX_ROWS = 300;

export type ParsedGradeRow = {
  term: string;
  code: string;
  name: string;
  credits: number;
  score: number | null;
  requiredType?: string | null;
  confidence: "high" | "medium" | "low";
};

type TextItem = { str: string; x: number; y: number };

function limitRows(rows: ParsedGradeRow[]) {
  if (rows.length <= TRANSCRIPT_MAX_ROWS) return rows;
  return rows.slice(0, TRANSCRIPT_MAX_ROWS);
}

export async function parseTranscriptPdf(buffer: Buffer): Promise<{
  rows: ParsedGradeRow[];
  textPreview: string;
  truncated?: boolean;
}> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const courses: Array<{
    name: string;
    required: string;
    credits: number;
    score: number | null;
    year: string;
    sem: string;
  }> = [];

  let leftYear: string | null = null;
  let rightYear: string | null = null;
  const textChunks: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const rawItems = content.items as Array<{ str?: string; transform?: number[] }>;
    const items: TextItem[] = rawItems
      .filter((it) => typeof it.str === "string" && it.str.trim())
      .map((it) => ({
        str: it.str || "",
        x: it.transform?.[4] ?? 0,
        y: it.transform?.[5] ?? 0,
      }));

    textChunks.push(
      items
        .slice()
        .sort((a, b) => b.y - a.y || a.x - b.x)
        .map((t) => t.str)
        .join(" ")
    );

    const rowMap = new Map<number, TextItem[]>();
    for (const it of items) {
      const key = Math.round(it.y);
      if (!rowMap.has(key)) rowMap.set(key, []);
      rowMap.get(key)!.push(it);
    }

    const rows = [...rowMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, arr]) => {
        arr.sort((a, b) => a.x - b.x);
        return { text: arr.map((a) => a.str).join(""), items: arr };
      });

    // merge vertically-split names within same column proximity
    const pendingLeft: { name: string; y: number } | null = null;
    void pendingLeft;

    for (const row of rows) {
      for (const m of row.text.matchAll(/(\d{3})學年/g)) {
        const hit = row.items.find((it) => it.str.includes(m[1]));
        const x = hit?.x ?? 0;
        if (x < 280) leftYear = m[1];
        else rightYear = m[1];
      }

      if (
        /修習學分|實得學分|操行成績|累計學分|抵免學分|姓名|學號|科目名稱|第一學期|Page:|附註|科目註記|成績註記|總學分|總平均|累計班排名|列印日期|系所：|畢業年月|WEB參考/.test(
          row.text
        )
      ) {
        // 雙欄中一側可能是摘要，另一側仍是科目：分開判斷
        const leftText = row.items.filter((it) => it.x < 290).map((i) => i.str).join("");
        const rightText = row.items.filter((it) => it.x >= 290).map((i) => i.str).join("");
        const leftOk =
          /(必|選)/.test(leftText) &&
          !/修習學分|實得學分|操行成績|累計學分|抵免學分/.test(leftText);
        const rightOk =
          /(必|選)/.test(rightText) &&
          !/修習學分|實得學分|操行成績|累計學分|抵免學分/.test(rightText);
        if (leftOk) parseSide(row.items.filter((it) => it.x < 290), leftYear, courses);
        if (rightOk) parseSide(row.items.filter((it) => it.x >= 290), rightYear, courses);
        continue;
      }

      const left = row.items.filter((it) => it.x < 290);
      const right = row.items.filter((it) => it.x >= 290);
      parseSide(left, leftYear, courses);
      parseSide(right, rightYear, courses);
    }
  }

  // Deduplicate identical entries but keep retakes in different terms
  const seen = new Set<string>();
  const rows: ParsedGradeRow[] = [];
  for (const c of courses) {
    const name = normalizeCourseName(c.name);
    if (!name || name.length < 2) continue;
    if (/^必$|^選$|^修$|^變$|^一\)$|^二\)$/.test(name)) continue;
    const key = `${c.year}-${c.sem}|${name}|${c.credits}|${c.score}|${c.required}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      term: `${c.year}-${c.sem}`,
      code: "",
      name,
      credits: c.credits,
      score: c.score,
      requiredType: c.required,
      confidence: "high",
    });
  }

  // Also merge obvious line-wrap fragments: name ending with －未 + next 來職場...
  const mergedAll = mergeWrappedNames(rows);
  const merged = limitRows(mergedAll);

  return {
    rows: merged,
    textPreview: textChunks.join("\n").slice(0, 2500),
    truncated: mergedAll.length > TRANSCRIPT_MAX_ROWS,
  };
}

/** 圖片 OCR 後解析（截圖／照片） */
export async function parseTranscriptImage(buffer: Buffer): Promise<{
  rows: ParsedGradeRow[];
  textPreview: string;
  truncated?: boolean;
}> {
  const Tesseract = await import("tesseract.js");
  const result = await Tesseract.recognize(buffer, "chi_tra+eng", {
    logger: () => undefined,
  });
  const text = result.data.text || "";
  const rows = limitRows(parseTranscriptText(text));
  return {
    rows,
    textPreview: text.slice(0, 2500),
    truncated: parseTranscriptText(text).length > TRANSCRIPT_MAX_ROWS,
  };
}

export function isPdfFile(file: { type?: string; name?: string }) {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type.includes("pdf") || name.endsWith(".pdf");
}

export function isImageFile(file: { type?: string; name?: string }) {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(name)
  );
}

function normalizeCourseName(name: string) {
  return name
    .replace(/\s+/g, "")
    .replace(/媒材實作I$/i, "媒材實作 I")
    .replace(/媒材實作II$/i, "媒材實作 II")
    .replace(/媒材實作Ⅰ/g, "媒材實作 I")
    .replace(/媒材實作Ⅱ/g, "媒材實作 II")
    .trim();
}

function mergeWrappedNames(rows: ParsedGradeRow[]) {
  const out: ParsedGradeRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i];
    const next = rows[i + 1];
    // fragment like 「－未」continuation
    if (next && /^來職場|^變$|^一\)|^二\)/.test(next.name) && cur.score == null) {
      out.push({ ...cur, name: cur.name + next.name });
      i += 1;
      continue;
    }
    if (cur.name.endsWith("自我蛻") && next && next.name === "變") {
      out.push({
        ...next,
        name: cur.name + "變",
        credits: next.credits || cur.credits,
        score: next.score ?? cur.score,
      });
      i += 1;
      continue;
    }
    if (cur.name.includes("當機器人來上班") && next && next.name.startsWith("來職場")) {
      out.push({
        ...next,
        name: "當機器人來上班－未來職場的AI必修課",
      });
      i += 1;
      continue;
    }
    if (next && next.name === "來職場的AI必修課" && !cur.name.includes("當機器人")) {
      // orphan fragment from wrapped title on other column
      out.push({ ...next, name: "當機器人來上班－未來職場的AI必修課" });
      i += 1;
      continue;
    }
    out.push(cur);
  }
  return out;
}

function parseSide(
  items: TextItem[],
  year: string | null,
  out: Array<{
    name: string;
    required: string;
    credits: number;
    score: number | null;
    year: string;
    sem: string;
  }>
) {
  if (!items.length || !year) return;
  const text = items.map((i) => i.str).join("");
  if (!/(必|選)/.test(text)) return;

  const typeItem = items.find((it) => it.str === "必" || it.str === "選");
  if (!typeItem) return;

  let name = items
    .filter((it) => it.x < typeItem.x - 1)
    .map((it) => it.str)
    .join("")
    .replace(/\s+/g, "")
    .trim();

  // transfer marker in name area
  if (!name) return;
  if (/^抵免課程/.test(name)) {
    // name might be on the other side; keep as-is
  }

  const after = items.filter((it) => it.x > typeItem.x + 1);
  const vals = after
    .map((it) => it.str.trim())
    .filter((s) => /^(--|\d+(?:\.\d+)?|抵)$/.test(s));

  const push = (sem: string, credits: number, score: number | null) => {
    if (Number.isNaN(credits)) return;
    out.push({
      name,
      required: typeItem.str,
      credits,
      score: score != null && !Number.isNaN(score) ? score : null,
      year,
      sem,
    });
  };

  // 抵免：選 1 抵 --
  if (vals.includes("抵")) {
    const creditIdx = vals.findIndex((v) => /^\d/.test(v));
    const credits = creditIdx >= 0 ? Number(vals[creditIdx]) : 0;
    push("1", credits, null);
    return;
  }

  if (vals.length >= 3 && vals[0] === "--") {
    push("2", Number(vals[1]), Number(vals[2]));
    return;
  }
  if (vals.length >= 3 && vals[2] === "--") {
    push("1", Number(vals[0]), Number(vals[1]));
    return;
  }
  if (vals.length >= 4 && vals.every((v) => v !== "--")) {
    push("1", Number(vals[0]), Number(vals[1]));
    push("2", Number(vals[2]), Number(vals[3]));
    return;
  }
  if (vals.length >= 2) {
    push("1", Number(vals[0]), Number(vals[1]));
  }
}

/** 簡易文字解析（示範資料／純文字成績單） */
export function parseTranscriptText(text: string): ParsedGradeRow[] {
  const normalized = text.replace(/\r/g, "");
  const rows: ParsedGradeRow[] = [];
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let currentTerm = "113-1";
  for (const line of lines) {
    const termMatch = line.match(/(10\d|11\d|12\d)[学學]?年?度?\s*[第]?([12暑])/);
    if (termMatch) {
      currentTerm = `${termMatch[1]}-${termMatch[2] === "暑" ? "S" : termMatch[2]}`;
      continue;
    }

    const compact = line.replace(/\s+/g, " ");
    // 支援手冊代碼：EDU101、GE-CN1、A-TD1、TE-M1、GS-C1、B-ED1 等
    const withCode =
      compact.match(
        /^([A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+|[A-Za-z]{1,6}\d{1,5}[A-Za-z]?)\s+(.+?)\s+(\d(?:\.\d)?)\s+(\d{1,3}(?:\.\d+)?|通過|抵免)$/
      ) ||
      compact.match(
        /^([A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+|[A-Za-z]{1,6}\d{1,5}[A-Za-z]?)\s+(.+?)\s+(\d(?:\.\d)?)\s+(\d{1,3}(?:\.\d+)?)$/
      );

    if (withCode) {
      const scoreRaw = withCode[4];
      const score =
        scoreRaw === "通過" || scoreRaw === "抵免" ? null : Number(scoreRaw);
      rows.push({
        term: currentTerm,
        code: withCode[1],
        name: withCode[2].trim(),
        credits: Number(withCode[3]),
        score: score != null && !Number.isNaN(score) ? score : null,
        confidence: "high",
      });
      continue;
    }

    // 無代碼：科目 學分 成績
    const loose = compact.match(/^(.{2,40}?)\s+(\d(?:\.\d)?)\s+(\d{1,3}(?:\.\d+)?)$/);
    if (loose) {
      rows.push({
        term: currentTerm,
        code: "",
        name: loose[1].trim(),
        credits: Number(loose[2]),
        score: Number(loose[3]),
        confidence: "medium",
      });
    }
  }

  const seen = new Set<string>();
  const filtered = rows.filter((r) => {
    const key = `${r.term}|${r.code}|${r.name}|${r.credits}|${r.score}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return limitRows(filtered);
}

export function demoTranscriptText() {
  return `
臺北市立大學 成績單（示範｜手冊課程）
學號：U11317016  姓名：示範學生
系所：學習與媒材設計學系

113學年度 第1學期
GE-CN1 國文(I)：閱讀與思辯 2 81
GE-EN1 英文(I) 2 93
EDU101 教育概論 2 95
EDU102 學習心理學 2 80
A-TD1 設計概論 2 91
A-TD2 設計素描 2 96
A-TD3 數位科技概論 2 96
B-TD1 數位影像創作 3 92
TE-M01 教學原理 2 88

113學年度 第2學期
GE-CN2 國文(II)：寫作表達 2 87
GE-EN2 英文(II) 2 91
GE-EN3 英文(III) 2 88
LAB101 媒材實作I 1 85
A-TD4 色彩學 2 95
A-TD5 網際網路概論 2 91
B-ED1 創造心理學 2 91
B-TD2 數位影片剪輯 2 98
TE-M06 班級經營 2 90
TE-F02 教育心理學 2 91
GS-C1 當代課程與教學議題研討 2 55
`.trim();
}
