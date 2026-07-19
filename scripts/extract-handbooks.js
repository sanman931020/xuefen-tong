const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function extractDocx(docxPath, outTxt) {
  const tmp = path.join(__dirname, "_dx_" + path.basename(outTxt, ".txt"));
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const zipPath = path.join(tmp, "d.zip");
  fs.copyFileSync(docxPath, zipPath);
  execFileSync(
    "powershell",
    ["-NoProfile", "-Command", `Expand-Archive -Force '${zipPath}' '${path.join(tmp, "out")}'`],
    { stdio: "ignore" }
  );
  const raw = fs.readFileSync(path.join(tmp, "out", "word", "document.xml"), "utf8");
  const parts = raw.split(/<\/w:p>/);
  const lines = [];
  for (const p of parts) {
    const ts = [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) =>
      m[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
    );
    const line = ts.join("").trim();
    if (line) lines.push(line);
  }
  fs.writeFileSync(outTxt, lines.join("\n"), "utf8");
  console.log(path.basename(docxPath), "lines", lines.length);
  return lines;
}

const base = path.join(__dirname, "..", "..");
const ug = extractDocx(path.join(base, "大學部課程手冊.docx"), path.join(__dirname, "..", "handbook-undergrad.txt"));
const master = extractDocx(path.join(base, "碩班課程手冊.docx"), path.join(__dirname, "..", "handbook-master.txt"));

const ugHits = ug.filter((l) =>
  /學習與媒材|畢業應修|共同必修|系專業|自由選修|教育|媒體|總學分|必修|選修|128|85/.test(l)
);
console.log("\n=== UG HITS ===");
ugHits.slice(0, 100).forEach((l) => console.log(l.slice(0, 200)));

const mHits = master.filter((l) => /畢業|學分|必修|選修|論文|碩士/.test(l));
console.log("\n=== MASTER HITS ===");
mHits.slice(0, 80).forEach((l) => console.log(l.slice(0, 200)));
