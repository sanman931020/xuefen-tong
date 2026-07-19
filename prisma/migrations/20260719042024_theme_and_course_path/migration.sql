-- AlterTable
ALTER TABLE "Program" ADD COLUMN "shortLabel" TEXT;

-- AlterTable
ALTER TABLE "RequirementGroup" ADD COLUMN "blockName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entryYear" INTEGER NOT NULL DEFAULT 113,
    "displayName" TEXT,
    "currentTerm" TEXT NOT NULL DEFAULT '114-2',
    "gpaScale" TEXT NOT NULL DEFAULT 'percent',
    "includeFailInAvg" BOOLEAN NOT NULL DEFAULT true,
    "themeColor" TEXT NOT NULL DEFAULT 'mint',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentProfile" ("createdAt", "currentTerm", "displayName", "entryYear", "gpaScale", "id", "includeFailInAvg", "updatedAt", "userId") SELECT "createdAt", "currentTerm", "displayName", "entryYear", "gpaScale", "id", "includeFailInAvg", "updatedAt", "userId" FROM "StudentProfile";
DROP TABLE "StudentProfile";
ALTER TABLE "new_StudentProfile" RENAME TO "StudentProfile";
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
