-- CreateTable
CREATE TABLE "ScheduleTermSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "week1Start" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleTermSetting_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduleMark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "period" INTEGER,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleMark_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTermSetting_profileId_term_key" ON "ScheduleTermSetting"("profileId", "term");

-- CreateIndex
CREATE INDEX "ScheduleMark_profileId_term_week_idx" ON "ScheduleMark"("profileId", "term", "week");
