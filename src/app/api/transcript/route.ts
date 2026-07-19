import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadCatalogCourses, matchCatalogCourse } from "@/lib/courseMatch";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/session";
import {
  parseTranscriptText,
  parseTranscriptPdf,
  parseTranscriptImage,
  demoTranscriptText,
  isPdfFile,
  isImageFile,
  TRANSCRIPT_MAX_ROWS,
  type ParsedGradeRow,
} from "@/lib/transcript";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  let rows: ParsedGradeRow[] = [];
  let textPreview = "";
  let truncated = false;
  let source: "pdf" | "image" | "demo" | "text" = "text";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const useDemo = form.get("demo") === "1";
    const file = form.get("file");

    if (useDemo) {
      source = "demo";
      const text = demoTranscriptText();
      rows = parseTranscriptText(text);
      textPreview = text.slice(0, 2500);
    } else if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        if (isPdfFile(file)) {
          source = "pdf";
          const parsed = await parseTranscriptPdf(buffer);
          rows = parsed.rows;
          textPreview = parsed.textPreview;
          truncated = Boolean(parsed.truncated);
          if (rows.length < 5) {
            try {
              const pdfParse = (await import("pdf-parse")).default as (
                buf: Buffer
              ) => Promise<{ text: string }>;
              const result = await pdfParse(buffer);
              const fallback = parseTranscriptText(result.text || "");
              if (fallback.length > rows.length) {
                rows = fallback;
                textPreview = (result.text || "").slice(0, 2500);
              }
            } catch {
              /* ignore */
            }
          }
        } else if (isImageFile(file)) {
          source = "image";
          const parsed = await parseTranscriptImage(buffer);
          rows = parsed.rows;
          textPreview = parsed.textPreview;
          truncated = Boolean(parsed.truncated);
        } else {
          return NextResponse.json(
            { error: "僅支援 PDF 或圖片（PNG／JPG／WEBP 等）" },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error(err);
        return NextResponse.json(
          { error: source === "image" ? "圖片辨識失敗，請改傳較清晰截圖或 PDF" : "PDF 解析失敗，請確認檔案格式" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: "請上傳 PDF／圖片或使用示範資料" }, { status: 400 });
    }
  } else {
    const body = await req.json();
    if (body.demo) {
      source = "demo";
      const text = demoTranscriptText();
      rows = parseTranscriptText(text);
      textPreview = text;
    } else if (body.text) {
      source = "text";
      rows = parseTranscriptText(String(body.text));
      textPreview = String(body.text).slice(0, 2500);
    } else {
      return NextResponse.json({ error: "缺少內容" }, { status: 400 });
    }
  }

  if (rows.length > TRANSCRIPT_MAX_ROWS) {
    rows = rows.slice(0, TRANSCRIPT_MAX_ROWS);
    truncated = true;
  }

  return NextResponse.json({
    ok: true,
    textPreview,
    rows,
    count: rows.length,
    maxRows: TRANSCRIPT_MAX_ROWS,
    truncated,
    source,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json();
  let rows = (body.rows || []) as Array<
    ParsedGradeRow & {
      programCode?: string;
      categoryCode?: string;
      status?: string;
      countInAvg?: boolean;
    }
  >;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "沒有可匯入的資料" }, { status: 400 });
  }

  if (rows.length > TRANSCRIPT_MAX_ROWS) {
    rows = rows.slice(0, TRANSCRIPT_MAX_ROWS);
  }

  const profile = await getOrCreateProfile(session.user.id);
  const prefer = profile.selectedPrograms.map((s) => s.program.code);
  const catalog = await loadCatalogCourses();
  let imported = 0;

  for (const r of rows) {
    const matched = matchCatalogCourse(catalog, {
      code: r.code,
      name: r.name,
      preferProgramCodes: prefer,
    });

    const courseId = matched?.id || null;
    const categoryCode = r.categoryCode || matched?.groupCode || null;
    const programCode = r.programCode || matched?.programCode || null;
    const credits = r.credits ?? matched?.credits ?? 0;

    const status =
      r.status ||
      (r.score != null && r.score < 60
        ? "failed"
        : r.score == null
          ? r.requiredType
            ? "taken"
            : "transferred"
          : "taken");

    await prisma.enrollment.create({
      data: {
        profileId: profile.id,
        courseId,
        customName: courseId ? null : r.name,
        customCode: courseId ? null : r.code || null,
        credits,
        term: r.term,
        status: r.score == null && /抵/.test(r.name) ? "transferred" : status,
        score: r.score,
        countInAvg: r.countInAvg ?? r.score != null,
        categoryCode,
        programCode,
        notes: r.requiredType ? `${r.requiredType}修` : null,
      },
    });
    imported += 1;
  }

  return NextResponse.json({ ok: true, imported, maxRows: TRANSCRIPT_MAX_ROWS });
}
