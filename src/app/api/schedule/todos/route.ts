import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const priorityEnum = z.enum(["red", "orange", "green"]);

const schema = z.object({
  term: z.string().min(3),
  week: z.coerce.number().int().min(1).max(16),
  content: z.string().min(1),
  priority: priorityEnum.optional().default("green"),
  done: z.boolean().optional(),
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
  content: string;
  priority: string;
  done: boolean;
}) {
  return {
    id: row.id,
    term: row.term,
    week: row.week,
    content: row.content,
    priority: row.priority,
    done: row.done,
  };
}

const PRIORITY_RANK: Record<string, number> = { red: 0, orange: 1, green: 2 };

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
  const todos = await prisma.scheduleTodo.findMany({
    where: { profileId, term, week },
  });

  todos.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pa = PRIORITY_RANK[a.priority] ?? 9;
    const pb = PRIORITY_RANK[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return NextResponse.json({ todos: todos.map(toDTO) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }

  const profileId = await getProfileId(session.user.id);
  const data = parsed.data;
  const todo = await prisma.scheduleTodo.create({
    data: {
      profileId,
      term: data.term.trim(),
      week: data.week,
      content: data.content.trim(),
      priority: data.priority,
      done: false,
    },
  });

  return NextResponse.json({ ok: true, todo: toDTO(todo) });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json();
  const id = body.id as string;
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  // 移動／複製到其他週次
  if (body.action === "move" || body.action === "copy") {
    const weeksRaw = Array.isArray(body.weeks) ? body.weeks : [];
    const weeks = [
      ...new Set(
        weeksRaw
          .map((w: unknown) => Number(w))
          .filter((w: number) => Number.isInteger(w) && w >= 1 && w <= 16)
      ),
    ] as number[];
    if (weeks.length === 0) {
      return NextResponse.json({ error: "請至少勾選一個週次" }, { status: 400 });
    }

    const profileId = await getProfileId(session.user.id);
    const existing = await prisma.scheduleTodo.findFirst({ where: { id, profileId } });
    if (!existing) return NextResponse.json({ error: "找不到項目" }, { status: 404 });

    const targets = weeks.filter((w) => w !== existing.week);
    if (body.action === "copy") {
      if (targets.length === 0) {
        return NextResponse.json({ error: "請勾選其他週次（複製不會改動本週）" }, { status: 400 });
      }
      await prisma.scheduleTodo.createMany({
        data: targets.map((w) => ({
          profileId,
          term: existing.term,
          week: w,
          content: existing.content,
          priority: existing.priority,
          done: existing.done,
        })),
      });
      return NextResponse.json({ ok: true, action: "copy", weeks: targets });
    }

    // move：刪除原週，並在勾選週次各建一筆
    const moveTargets = weeks.length ? weeks : targets;
    if (moveTargets.length === 0) {
      return NextResponse.json({ error: "請勾選目標週次" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.scheduleTodo.delete({ where: { id } }),
      prisma.scheduleTodo.createMany({
        data: moveTargets.map((w) => ({
          profileId,
          term: existing.term,
          week: w,
          content: existing.content,
          priority: existing.priority,
          done: existing.done,
        })),
      }),
    ]);
    return NextResponse.json({ ok: true, action: "move", weeks: moveTargets });
  }

  const parsed = schema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }

  const profileId = await getProfileId(session.user.id);
  const existing = await prisma.scheduleTodo.findFirst({ where: { id, profileId } });
  if (!existing) return NextResponse.json({ error: "找不到項目" }, { status: 404 });

  const data = parsed.data;
  const todo = await prisma.scheduleTodo.update({
    where: { id },
    data: {
      content: data.content?.trim() ?? existing.content,
      priority: data.priority ?? existing.priority,
      done: data.done ?? existing.done,
      week: data.week ?? existing.week,
    },
  });

  return NextResponse.json({ ok: true, todo: toDTO(todo) });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const profileId = await getProfileId(session.user.id);
  const existing = await prisma.scheduleTodo.findFirst({ where: { id, profileId } });
  if (!existing) return NextResponse.json({ error: "找不到項目" }, { status: 404 });

  await prisma.scheduleTodo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
