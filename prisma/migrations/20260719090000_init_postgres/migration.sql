-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryYear" INTEGER NOT NULL DEFAULT 113,
    "currentGrade" INTEGER NOT NULL DEFAULT 1,
    "expectedGradYear" INTEGER,
    "displayName" TEXT,
    "currentTerm" TEXT NOT NULL DEFAULT '114-2',
    "gpaScale" TEXT NOT NULL DEFAULT 'percent',
    "includeFailInAvg" BOOLEAN NOT NULL DEFAULT true,
    "themeColor" TEXT NOT NULL DEFAULT 'mint',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "shortLabel" TEXT,
    "version" TEXT NOT NULL DEFAULT '113',
    "description" TEXT,
    "totalCredits" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgram" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementGroup" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blockName" TEXT,
    "minCredits" INTEGER NOT NULL DEFAULT 0,
    "maxCredits" INTEGER,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RequirementGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "groupId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prerequisite" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "requiredCourseId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "Prerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NonCreditRequirement" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NonCreditRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "courseId" TEXT,
    "customName" TEXT,
    "customCode" TEXT,
    "credits" DOUBLE PRECISION NOT NULL,
    "term" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'taken',
    "score" DOUBLE PRECISION,
    "letterGrade" TEXT,
    "countInAvg" BOOLEAN NOT NULL DEFAULT true,
    "categoryCode" TEXT,
    "programCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "teacher" TEXT NOT NULL DEFAULT '',
    "room" TEXT NOT NULL DEFAULT '',
    "tag" TEXT,
    "weekday" INTEGER NOT NULL,
    "periods" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTermSetting" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "week1Start" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTermSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleMark" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "period" INTEGER,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'blue',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTodo" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'green',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleHoliday" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

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

-- CreateIndex
CREATE INDEX "ScheduleEntry_profileId_term_idx" ON "ScheduleEntry"("profileId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleTermSetting_profileId_term_key" ON "ScheduleTermSetting"("profileId", "term");

-- CreateIndex
CREATE INDEX "ScheduleMark_profileId_term_week_idx" ON "ScheduleMark"("profileId", "term", "week");

-- CreateIndex
CREATE INDEX "ScheduleTodo_profileId_term_week_idx" ON "ScheduleTodo"("profileId", "term", "week");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleHoliday_profileId_date_key" ON "ScheduleHoliday"("profileId", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementGroup" ADD CONSTRAINT "RequirementGroup_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "RequirementGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prerequisite" ADD CONSTRAINT "Prerequisite_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prerequisite" ADD CONSTRAINT "Prerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prerequisite" ADD CONSTRAINT "Prerequisite_requiredCourseId_fkey" FOREIGN KEY ("requiredCourseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonCreditRequirement" ADD CONSTRAINT "NonCreditRequirement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTermSetting" ADD CONSTRAINT "ScheduleTermSetting_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMark" ADD CONSTRAINT "ScheduleMark_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTodo" ADD CONSTRAINT "ScheduleTodo_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleHoliday" ADD CONSTRAINT "ScheduleHoliday_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
