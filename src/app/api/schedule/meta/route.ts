import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultWeek1Start } from "@/lib/schedule";

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

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const term = new URL(req.url).searchParams.get("term")?.trim();
  if (!term) return NextResponse.json({ error: "缺少 term" }, { status: 400 });

  const profileId = await getProfileId(session.user.id);
  const row = await prisma.scheduleTermSetting.findUnique({
    where: { profileId_term: { profileId, term } },
  });

  return NextResponse.json({
    term,
    week1Start: row?.week1Start || defaultWeek1Start(term),
  });
}

const putSchema = z.object({
  term: z.string().min(3),
  week1Start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const parsed = putSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }

  const profileId = await getProfileId(session.user.id);
  const { term, week1Start } = parsed.data;

  const row = await prisma.scheduleTermSetting.upsert({
    where: { profileId_term: { profileId, term } },
    create: { profileId, term, week1Start },
    update: { week1Start },
  });

  return NextResponse.json({ ok: true, week1Start: row.week1Start });
}
