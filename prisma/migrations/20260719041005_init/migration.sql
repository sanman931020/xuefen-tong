-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entryYear" INTEGER NOT NULL DEFAULT 113,
    "displayName" TEXT,
    "currentTerm" TEXT NOT NULL DEFAULT '114-2',
    "gpaScale" TEXT NOT NULL DEFAULT 'percent',
    "includeFailInAvg" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '113',
    "description" TEXT,
    "totalCredits" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "UserProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProgram_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequirementGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minCredits" INTEGER NOT NULL DEFAULT 0,
    "maxCredits" INTEGER,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RequirementGroup_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "groupId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Course_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "RequirementGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prerequisite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "requiredCourseId" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "Prerequisite_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prerequisite_requiredCourseId_fkey" FOREIGN KEY ("requiredCourseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NonCreditRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "NonCreditRequirement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "courseId" TEXT,
    "customName" TEXT,
    "customCode" TEXT,
    "credits" REAL NOT NULL,
    "term" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'taken',
    "score" REAL,
    "letterGrade" TEXT,
    "countInAvg" BOOLEAN NOT NULL DEFAULT true,
    "categoryCode" TEXT,
    "programCode" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enrollment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgram_profileId_programId_key" ON "UserProgram"("profileId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementGroup_programId_code_key" ON "RequirementGroup"("programId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_programId_code_key" ON "Course"("programId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Prerequisite_courseId_requiredCourseId_key" ON "Prerequisite"("courseId", "requiredCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "NonCreditRequirement_programId_code_key" ON "NonCreditRequirement"("programId", "code");
