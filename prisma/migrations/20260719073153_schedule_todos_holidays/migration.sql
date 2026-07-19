-- CreateTable
CREATE TABLE "ScheduleTodo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'green',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleTodo_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduleHoliday" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduleHoliday_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ScheduleTodo_profileId_term_week_idx" ON "ScheduleTodo"("profileId", "term", "week");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleHoliday_profileId_date_key" ON "ScheduleHoliday"("profileId", "date");
