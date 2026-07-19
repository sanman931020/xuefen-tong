const fs = require("fs");
const path = require("path");

async function main() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(path.join(__dirname, "..", "..", "學生歷年成績單範例.pdf")));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  /** @type {{name:string,required:string,credits:number,score:number|null,term:string,year:string,sem:string}[]} */
  const courses = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
      }))
      .filter((it) => it.str.trim());

    // group by y
    const rowMap = new Map();
    for (const it of items) {
      const key = Math.round(it.y);
      if (!rowMap.has(key)) rowMap.set(key, []);
      rowMap.get(key).push(it);
    }
    const rows = [...rowMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([y, arr]) => {
        arr.sort((a, b) => a.x - b.x);
        return { y, text: arr.map((a) => a.str).join(""), items: arr };
      });

    let leftYear = null;
    let rightYear = null;
    for (const row of rows) {
      const yearMatch = [...row.text.matchAll(/(\d{3})學年/g)];
      for (const m of yearMatch) {
        const x = row.items.find((it) => it.str.includes(m[1]))?.x ?? 0;
        if (x < 280) leftYear = m[1];
        else rightYear = m[1];
      }

      // skip summary rows
      if (/修習學分|實得學分|操行成績|累計學分|抵免學分|姓名|學號|科目名稱|第一學期|Page:|附註|科目註記|成績註記|總學分|總平均|累計班排名/.test(row.text)) {
        continue;
      }

      const left = row.items.filter((it) => it.x < 290);
      const right = row.items.filter((it) => it.x >= 290);
      parseSide(left, leftYear, "L", courses);
      parseSide(right, rightYear, "R", courses);
    }
  }

  console.log("parsed", courses.length);
  courses.forEach((c, i) => console.log(i + 1, c.term, c.required, c.credits, c.score, c.name));
  fs.writeFileSync(path.join(__dirname, "parsed-sample.json"), JSON.stringify(courses, null, 2));
}

function parseSide(items, year, side, out) {
  if (!items.length || !year) return;
  const text = items.map((i) => i.str).join("");
  if (!/(必|選)/.test(text)) return;
  if (/^必$|^選$|^修$/.test(text.trim())) return;

  // Find 必/選 marker
  const typeItem = items.find((it) => it.str === "必" || it.str === "選");
  if (!typeItem) return;
  const name = items
    .filter((it) => it.x < typeItem.x - 1)
    .map((it) => it.str)
    .join("")
    .replace(/\s+/g, "")
    .trim();
  if (!name || name.length < 2) return;

  const after = items.filter((it) => it.x > typeItem.x + 1);
  const nums = after.filter((it) => /^(--|\d+(?:\.\d+)?)$/.test(it.str.trim()));

  // Patterns:
  // S1: credits, score, --
  // S2: --, credits, score
  // both: credits, score, credits, score (rare)
  // zero credit PE with both semesters: 0, score, 0, score
  let sem = "1";
  let credits = 0;
  let score = null;

  const vals = nums.map((n) => n.str.trim());
  if (vals.length >= 3 && vals[0] === "--") {
    sem = "2";
    credits = Number(vals[1]);
    score = Number(vals[2]);
  } else if (vals.length >= 3 && vals[2] === "--") {
    sem = "1";
    credits = Number(vals[0]);
    score = Number(vals[1]);
  } else if (vals.length >= 4 && vals.every((v) => v !== "--")) {
    // take first semester values primarily; if both, prefer first non-null
    sem = "1";
    credits = Number(vals[0]);
    score = Number(vals[1]);
    // also push second if present
    out.push({
      name,
      required: typeItem.str,
      credits: Number(vals[2]),
      score: Number(vals[3]),
      year,
      sem: "2",
      term: `${year}-2`,
    });
  } else if (vals.length >= 2) {
    credits = Number(vals[0]);
    score = Number(vals[1]);
    sem = "1";
  } else {
    return;
  }

  if (Number.isNaN(credits)) return;
  out.push({
    name,
    required: typeItem.str,
    credits,
    score: Number.isNaN(score) ? null : score,
    year,
    sem,
    term: `${year}-${sem}`,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
