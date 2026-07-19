import { PrismaClient } from "@prisma/client";
import { DEGREE_PROGRAMS } from "./data/degreePrograms";
import { TEACHER_PROGRAMS } from "./data/teacherPrograms";

const prisma = new PrismaClient();

type CourseSeed = {
  code: string;
  name: string;
  credits: number;
  group: string;
  notes?: string;
};

async function seedProgram(opts: {
  code: string;
  name: string;
  type: string;
  shortLabel: string;
  description: string;
  totalCredits: number;
  sortOrder: number;
  groups: {
    code: string;
    name: string;
    blockName?: string;
    minCredits: number;
    description?: string;
  }[];
  courses: CourseSeed[];
  prereqs?: { course: string; requires: string; note?: string }[];
  nonCredits?: { code: string; name: string; description: string }[];
}) {
  const program = await prisma.program.upsert({
    where: { code: opts.code },
    create: {
      code: opts.code,
      name: opts.name,
      type: opts.type,
      shortLabel: opts.shortLabel,
      version: "113",
      description: opts.description,
      totalCredits: opts.totalCredits,
      sortOrder: opts.sortOrder,
    },
    update: {
      name: opts.name,
      type: opts.type,
      shortLabel: opts.shortLabel,
      description: opts.description,
      totalCredits: opts.totalCredits,
      sortOrder: opts.sortOrder,
    },
  });

  await prisma.prerequisite.deleteMany({ where: { programId: program.id } });
  await prisma.enrollment.updateMany({
    where: { course: { programId: program.id } },
    data: { courseId: null },
  });
  await prisma.course.deleteMany({ where: { programId: program.id } });
  await prisma.requirementGroup.deleteMany({ where: { programId: program.id } });
  await prisma.nonCreditRequirement.deleteMany({ where: { programId: program.id } });

  const groupMap = new Map<string, string>();
  for (const [i, g] of opts.groups.entries()) {
    const row = await prisma.requirementGroup.create({
      data: {
        programId: program.id,
        code: g.code,
        name: g.name,
        blockName: g.blockName,
        minCredits: g.minCredits,
        description: g.description,
        sortOrder: i,
      },
    });
    groupMap.set(g.code, row.id);
  }

  const courseMap = new Map<string, string>();
  for (const [i, c] of opts.courses.entries()) {
    const code = c.code || `AUTO${String(i).padStart(3, "0")}`;
    const row = await prisma.course.create({
      data: {
        programId: program.id,
        groupId: groupMap.get(c.group),
        code,
        name: c.name,
        credits: c.credits,
        notes: c.notes,
      },
    });
    courseMap.set(code, row.id);
    courseMap.set(c.name, row.id);
  }

  if (opts.prereqs) {
    for (const p of opts.prereqs) {
      const courseId = courseMap.get(p.course);
      const requiredCourseId = courseMap.get(p.requires);
      if (!courseId || !requiredCourseId) continue;
      await prisma.prerequisite.create({
        data: {
          programId: program.id,
          courseId,
          requiredCourseId,
          note: p.note,
        },
      });
    }
  }

  if (opts.nonCredits) {
    for (const [i, n] of opts.nonCredits.entries()) {
      await prisma.nonCreditRequirement.create({
        data: {
          programId: program.id,
          code: n.code,
          name: n.name,
          description: n.description,
          sortOrder: i,
        },
      });
    }
  }

  return program;
}

async function main() {
  const allCodes = [
    ...DEGREE_PROGRAMS.map((p) => p.code),
    ...TEACHER_PROGRAMS.map((p) => p.code),
  ];

  // ???????????????? program.code ???seed ????
  const previousSelections = await prisma.userProgram.findMany({
    include: { program: { select: { code: true } } },
  });
  const savedSelections = previousSelections
    .filter((s) => s.program?.code)
    .map((s) => ({ profileId: s.profileId, programCode: s.program.code, active: s.active }));

  for (const code of allCodes) {
    const old = await prisma.program.findUnique({ where: { code } });
    if (!old) continue;
    await prisma.prerequisite.deleteMany({ where: { programId: old.id } });
    await prisma.userProgram.deleteMany({ where: { programId: old.id } });
    await prisma.enrollment.updateMany({
      where: { course: { programId: old.id } },
      data: { courseId: null },
    });
    await prisma.course.deleteMany({ where: { programId: old.id } });
    await prisma.requirementGroup.deleteMany({ where: { programId: old.id } });
    await prisma.nonCreditRequirement.deleteMany({ where: { programId: old.id } });
    await prisma.program.delete({ where: { id: old.id } });
  }

  for (const prog of DEGREE_PROGRAMS) {
    await seedProgram(prog);
  }
  for (const prog of TEACHER_PROGRAMS) {
    await seedProgram(prog);
  }

  // ???????
  const programs = await prisma.program.findMany({
    where: { code: { in: [...new Set(savedSelections.map((s) => s.programCode))] } },
    select: { id: true, code: true },
  });
  const idByCode = new Map(programs.map((p) => [p.code, p.id]));
  let restored = 0;
  for (const s of savedSelections) {
    const programId = idByCode.get(s.programCode);
    if (!programId) continue;
    await prisma.userProgram.upsert({
      where: {
        profileId_programId: { profileId: s.profileId, programId },
      },
      create: {
        profileId: s.profileId,
        programId,
        active: s.active,
      },
      update: { active: s.active },
    });
    restored += 1;
  }

  for (const code of allCodes) {
    const n = await prisma.course.count({ where: { program: { code } } });
    console.log(`${code}: ${n} courses`);
  }
  console.log(`Restored ${restored} user program selection(s).`);
  console.log("Seed completed from UTaipei handbooks (113).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
