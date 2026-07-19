import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  mergeTermOptions,
  parsePeriods,
  pickLatestTerm,
  SCHEDULE_COLORS,
} from "@/lib/schedule";

const entrySchema = z.object({
  term: z.string().min(3),
  courseName: z.string().min(1),
  teacher: z.string().nullish(),
  room: z.string().nullish(),
  tag: z.string().nullish(),
  weekday: z.coerce.number().int().min(1).max(7),
  periods: z.array(z.coerce.number().int().min(1).max(14)).min(1),
  color: z.string().nullish(),
});

async function getProfile(userId: string) {
  const existing = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, currentTerm: true },
  });
  if (existing) return existing;
  return prisma.studentProfile.create({
    data: { userId },
    select: { id: true, currentTerm: true },
  });
}

function toDTO(row: {
  id: string;
  term: string;
  courseName: string;
  teacher: string;
  room: string;
  tag: string | null;
  weekday: number;
  periods: string;
  color: string | null;
}) {
  return {
    id: row.id,
    term: row.term,
    courseName: row.courseName,
    teacher: row.teacher,
    room: row.room,
    tag: row.tag,
    weekday: row.weekday,
    periods: parsePeriods(row.periods),
    color: row.color,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    const profile = await getProfile(session.user.id);
    const { searchParams } = new URL(req.url);
    let term = (searchParams.get("term") || "").trim();

    const all = await prisma.scheduleEntry.findMany({
      where: { profileId: profile.id },
      select: { term: true },
    });
    const savedTerms = Array.from(new Set(all.map((e) => e.term)));
    const latest = pickLatestTerm(savedTerms.length > 0 ? savedTerms : ["115-1"], "115-1");
    if (!term) term = latest;

    const terms = mergeTermOptions([...savedTerms, term]);

    const entries = await prisma.scheduleEntry.findMany({
      where: { profileId: profile.id, term },
      orderBy: [{ weekday: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      term,
      terms,
      currentTerm: profile.currentTerm,
      latestTerm: latest,
      entries: entries.map(toDTO),
    });
  } catch (err) {
    console.error("[schedule GET]", err);
    return NextResponse.json({ error: "載入課表失敗" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    if (!prisma.scheduleEntry) {
      return NextResponse.json(
        { error: "課表模組未就緒，請重新啟動開發伺服器後再試" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "資料格式錯誤", detail: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const profile = await getProfile(session.user.id);
    const data = parsed.data;
    const color =
      data.color?.trim() ||
      SCHEDULE_COLORS[Math.floor(Math.random() * SCHEDULE_COLORS.length)];

    const entry = await prisma.scheduleEntry.create({
      data: {
        profileId: profile.id,
        term: data.term.trim(),
        courseName: data.courseName.trim(),
        teacher: (data.teacher ?? "").trim(),
        room: (data.room ?? "").trim(),
        tag: data.tag?.trim() || null,
        weekday: data.weekday,
        periods: JSON.stringify([...new Set(data.periods)].sort((a, b) => a - b)),
        color,
      },
    });

    return NextResponse.json({ ok: true, entry: toDTO(entry) });
  } catch (err) {
    console.error("[schedule POST]", err);
    const msg = err instanceof Error ? err.message : "儲存失敗";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = body.id as string;
    if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

    const parsed = entrySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
    }

    const profile = await getProfile(session.user.id);
    const existing = await prisma.scheduleEntry.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!existing) return NextResponse.json({ error: "找不到課表項目" }, { status: 404 });

    const data = parsed.data;
    const entry = await prisma.scheduleEntry.update({
      where: { id },
      data: {
        term: data.term?.trim() ?? existing.term,
        courseName: data.courseName?.trim() ?? existing.courseName,
        teacher: data.teacher !== undefined ? (data.teacher ?? "").trim() : existing.teacher,
        room: data.room !== undefined ? (data.room ?? "").trim() : existing.room,
        tag: data.tag !== undefined ? data.tag?.trim() || null : existing.tag,
        weekday: data.weekday ?? existing.weekday,
        periods: data.periods
          ? JSON.stringify([...new Set(data.periods)].sort((a, b) => a - b))
          : existing.periods,
        color: data.color !== undefined ? data.color : existing.color,
      },
    });

    return NextResponse.json({ ok: true, entry: toDTO(entry) });
  } catch (err) {
    console.error("[schedule PATCH]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

    const profile = await getProfile(session.user.id);
    const existing = await prisma.scheduleEntry.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!existing) return NextResponse.json({ error: "找不到課表項目" }, { status: 404 });

    await prisma.scheduleEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[schedule DELETE]", err);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
