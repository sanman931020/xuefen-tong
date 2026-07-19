import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/session";

const schema = z.object({
  entryYear: z.number().int().min(100).max(130).optional(),
  currentGrade: z.number().int().min(1).max(8).optional(),
  expectedGradYear: z.number().int().min(100).max(140).optional().nullable(),
  displayName: z.string().max(50).optional().nullable(),
  currentTerm: z.string().optional(),
  includeFailInAvg: z.boolean().optional(),
  themeColor: z
    .enum(["beige", "mint", "sky", "butter", "lilac", "blush", "peach"])
    .optional(),
  programCodes: z.array(z.string()).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }

  const profile = await getOrCreateProfile(session.user.id);
  const data = parsed.data;

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: {
      entryYear: data.entryYear ?? profile.entryYear,
      currentGrade: data.currentGrade ?? profile.currentGrade,
      expectedGradYear:
        data.expectedGradYear === undefined
          ? profile.expectedGradYear
          : data.expectedGradYear,
      displayName: data.displayName === undefined ? profile.displayName : data.displayName,
      currentTerm: data.currentTerm ?? profile.currentTerm,
      includeFailInAvg: data.includeFailInAvg ?? profile.includeFailInAvg,
      themeColor: data.themeColor ?? profile.themeColor,
    },
  });

  if (data.programCodes !== undefined) {
    const programs = await prisma.program.findMany({
      where: { code: { in: data.programCodes } },
    });
    await prisma.userProgram.deleteMany({ where: { profileId: profile.id } });
    if (programs.length) {
      await prisma.userProgram.createMany({
        data: programs.map((p) => ({
          profileId: profile.id,
          programId: p.id,
          active: true,
        })),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
