import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCourseCategoryPath } from "@/lib/themes";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { code: { contains: q.toUpperCase() } },
      ],
    },
    include: {
      program: true,
      group: true,
    },
    orderBy: [{ name: "asc" }, { code: "asc" }],
    take: 30,
  });

  const items = courses.map((c) => {
    const blockFromNotes = c.notes?.match(/(.+區塊)/)?.[1] || null;
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      credits: c.credits,
      notes: c.notes,
      programCode: c.program.code,
      programName: c.program.name,
      groupCode: c.group?.code || null,
      groupName: c.group?.name || null,
      path: buildCourseCategoryPath({
        programType: c.program.type,
        programName: c.program.name,
        shortLabel: c.program.shortLabel,
        blockName: blockFromNotes || c.group?.blockName,
        groupName: c.group?.name,
      }),
    };
  });

  return NextResponse.json({ items });
}
