import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().min(1),
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const profileId = await getProfileId(session.user.id);
  const holidays = await prisma.scheduleHoliday.findMany({
    where: { profileId },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    holidays: holidays.map((h) => ({ id: h.id, date: h.date, name: h.name })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "請填寫日期與假日名稱" }, { status: 400 });
  }

  const profileId = await getProfileId(session.user.id);
  const { date, name } = parsed.data;

  try {
    const holiday = await prisma.scheduleHoliday.upsert({
      where: { profileId_date: { profileId, date } },
      create: { profileId, date, name: name.trim() },
      update: { name: name.trim() },
    });
    return NextResponse.json({
      ok: true,
      holiday: { id: holiday.id, date: holiday.date, name: holiday.name },
    });
  } catch (err) {
    console.error("[holidays POST]", err);
    return NextResponse.json({ error: "儲存失敗" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const profileId = await getProfileId(session.user.id);
  const existing = await prisma.scheduleHoliday.findFirst({ where: { id, profileId } });
  if (!existing) return NextResponse.json({ error: "找不到假日" }, { status: 404 });

  await prisma.scheduleHoliday.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
