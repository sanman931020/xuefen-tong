import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const kindEnum = z.enum(["memo", "holiday", "exam", "homework", "important"]);
const colorEnum = z.enum(["red", "orange", "yellow", "green", "blue", "purple"]);

const markSchema = z.object({
  term: z.string().min(3),
  week: z.coerce.number().int().min(1).max(16),
  weekday: z.coerce.number().int().min(1).max(7),
  period: z.coerce.number().int().min(1).max(14).nullish(),
  kind: kindEnum,
  content: z.string().optional().default(""),
  color: colorEnum.optional().default("blue"),
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

function toDTO(row: {
  id: string;
  term: string;
  week: number;
  weekday: number;
  period: number | null;
  kind: string;
  content: string;
  color: string;
}) {
  return {
    id: row.id,
    term: row.term,
    week: row.week,
    weekday: row.weekday,
    period: row.period,
    kind: row.kind,
    content: row.content,
    color: row.color || "blue",
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term")?.trim();
  const week = Number(searchParams.get("week") || "0");
  if (!term || !week) {
    return NextResponse.json({ error: "缺少 term 或 week" }, { status: 400 });
  }

  const profileId = await getProfileId(session.user.id);
  const marks = await prisma.scheduleMark.findMany({
    where: { profileId, term, week },
    orderBy: [{ weekday: "asc" }, { period: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ marks: marks.map(toDTO) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    const parsed = markSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "資料格式錯誤", detail: parsed.error.flatten() }, { status: 400 });
    }

    const profileId = await getProfileId(session.user.id);
    const data = parsed.data;
    const mark = await prisma.scheduleMark.create({
      data: {
        profileId,
        term: data.term.trim(),
        week: data.week,
        weekday: data.weekday,
        period: data.period ?? null,
        kind: data.kind,
        content: (data.content || "").trim(),
        color: data.color || "blue",
      },
    });

    return NextResponse.json({ ok: true, mark: toDTO(mark) });
  } catch (err) {
    console.error("[schedule marks POST]", err);
    return NextResponse.json({ error: "新增失敗" }, { status: 500 });
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

    const parsed = markSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
    }

    const profileId = await getProfileId(session.user.id);
    const existing = await prisma.scheduleMark.findFirst({ where: { id, profileId } });
    if (!existing) return NextResponse.json({ error: "找不到標記" }, { status: 404 });

    const data = parsed.data;
    const mark = await prisma.scheduleMark.update({
      where: { id },
      data: {
        week: data.week ?? existing.week,
        weekday: data.weekday ?? existing.weekday,
        period: data.period !== undefined ? data.period ?? null : existing.period,
        kind: data.kind ?? existing.kind,
        content: data.content !== undefined ? data.content.trim() : existing.content,
        color: data.color ?? existing.color,
      },
    });

    return NextResponse.json({ ok: true, mark: toDTO(mark) });
  } catch (err) {
    console.error("[schedule marks PATCH]", err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
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
  const existing = await prisma.scheduleMark.findFirst({ where: { id, profileId } });
  if (!existing) return NextResponse.json({ error: "找不到標記" }, { status: 404 });

  await prisma.scheduleMark.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
