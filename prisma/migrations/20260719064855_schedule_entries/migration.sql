-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "teacher" TEXT NOT NULL DEFAULT '',
    "room" TEXT NOT NULL DEFAULT '',
    "tag" TEXT,
    "weekday" INTEGER NOT NULL,
    "periods" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ScheduleEntry_profileId_term_idx" ON "ScheduleEntry"("profileId", "term");
