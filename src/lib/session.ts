import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichEnrollments, loadCatalogCourses } from "@/lib/courseMatch";
import type { EnrollmentLike } from "@/lib/progress";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return { ...session.user, id: session.user.id };
}

export async function getOrCreateProfile(userId: string) {
  let profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      selectedPrograms: { include: { program: true } },
      enrollments: {
        include: {
          course: {
            include: {
              group: true,
              program: true,
            },
          },
        },
        orderBy: [{ term: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: { userId },
      include: {
        selectedPrograms: { include: { program: true } },
        enrollments: {
          include: {
            course: {
              include: {
                group: true,
                program: true,
              },
            },
          },
          orderBy: [{ term: "asc" }, { createdAt: "asc" }],
        },
      },
    });
  }

  // 自動補齊缺失的學制／類別，並寫回資料庫，讓總覽進度接得上
  const prefer = profile.selectedPrograms.map((s) => s.program.code);
  const catalog = await loadCatalogCourses();
  const enriched = enrichEnrollments(profile.enrollments as EnrollmentLike[], catalog, prefer);

  await Promise.all(
    enriched.map(async (e, i) => {
      const raw = profile!.enrollments[i];
      if (!raw) return;
      const nextProgram = e.programCode;
      const nextCategory = e.categoryCode;
      const nextCourseId = e.courseId;
      const needsUpdate =
        (nextProgram && nextProgram !== raw.programCode) ||
        (nextCategory && nextCategory !== raw.categoryCode) ||
        (nextCourseId && nextCourseId !== raw.courseId);
      if (!needsUpdate) return;
      await prisma.enrollment.update({
        where: { id: raw.id },
        data: {
          programCode: nextProgram || raw.programCode,
          categoryCode: nextCategory || raw.categoryCode,
          courseId: nextCourseId || raw.courseId,
        },
      });
      raw.programCode = nextProgram || raw.programCode;
      raw.categoryCode = nextCategory || raw.categoryCode;
      if (nextCourseId) raw.courseId = nextCourseId;
    })
  );

  return profile;
}
