import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  courseId: z.string().optional().nullable(),
  customName: z.string().optional().nullable(),
  customCode: z.string().optional().nullable(),
  credits: z.number().min(0),
  term: z.string().min(3),
  status: z.enum(["taken", "in_progress", "planned", "failed", "transferred"]),
  score: z.number().min(0).max(100).optional().nullable(),
  countInAvg: z.boolean().optional(),
  categoryCode: z.string().optional().nullable(),
  programCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

async function getProfileId(userId: string) {
  const existing = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.studentProfile.create({
    data: { userId },
    select: { id: true },
  });
  return created.id;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json();
  // 前端偶發把 credits 傳成字串，寬鬆轉成數字
  if (body && typeof body.credits === "string") {
    body.credits = Number(body.credits);
  }
  if (body && typeof body.score === "string" && body.score !== "") {
    body.score = Number(body.score);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "資料格式錯誤", detail: parsed.error.flatten() }, { status: 400 });
  }

  const profileId = await getProfileId(session.user.id);
  const data = parsed.data;

  let credits = data.credits;
  let categoryCode = data.categoryCode;
  let programCode = data.programCode;
  let courseId = data.courseId || null;

  if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { group: true, program: true },
    });
    if (course) {
      if (data.credits == null || Number.isNaN(credits)) credits = course.credits;
      categoryCode = categoryCode || course.group?.code || null;
      programCode = programCode || course.program.code;
    } else {
      courseId = null;
    }
  }

  const name = (data.customName || "").trim() || null;
  if (!courseId && !name) {
    return NextResponse.json({ error: "請填寫科目名稱" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      profileId,
      courseId,
      customName: courseId ? name : name,
      customCode: courseId ? data.customCode || null : data.customCode || null,
      credits: Number.isFinite(credits) ? credits : 0,
      term: data.term,
      status: data.status,
      score: data.score ?? null,
      countInAvg: data.countInAvg ?? data.status !== "transferred",
      categoryCode,
      programCode,
      notes: data.notes || null,
    },
  });

  return NextResponse.json({ ok: true, enrollment });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json();
  const id = body.id as string;
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const profileId = await getProfileId(session.user.id);
  const existing = await prisma.enrollment.findFirst({
    where: { id, profileId },
  });
  if (!existing) return NextResponse.json({ error: "找不到紀錄" }, { status: 404 });

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      score: body.score === undefined ? existing.score : body.score,
      term: body.term ?? existing.term,
      credits: body.credits === undefined ? existing.credits : Number(body.credits),
      customName: body.customName === undefined ? existing.customName : body.customName,
      customCode: body.customCode === undefined ? existing.customCode : body.customCode,
      countInAvg: body.countInAvg ?? existing.countInAvg,
      categoryCode: body.categoryCode ?? existing.categoryCode,
      programCode: body.programCode ?? existing.programCode,
      notes: body.notes ?? existing.notes,
    },
  });

  return NextResponse.json({ ok: true, enrollment });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const profileId = await getProfileId(session.user.id);
  const existing = await prisma.enrollment.findFirst({
    where: { id, profileId },
  });
  if (!existing) return NextResponse.json({ error: "找不到紀錄" }, { status: 404 });

  await prisma.enrollment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
