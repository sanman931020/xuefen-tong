-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("id", "name", "email", "emailVerified", "image", "passwordHash", "createdAt", "updatedAt", "username")
SELECT
  "id",
  "name",
  "email",
  "emailVerified",
  "image",
  "passwordHash",
  "createdAt",
  "updatedAt",
  CASE
    WHEN "email" IS NOT NULL AND instr("email", '@') > 1
      THEN lower(substr("email", 1, instr("email", '@') - 1))
    ELSE NULL
  END
FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
