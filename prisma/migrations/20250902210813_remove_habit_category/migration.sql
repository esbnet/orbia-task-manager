/*
  Warnings:

  - You are about to drop the `dailys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."daily_logs" DROP CONSTRAINT "daily_logs_dailyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."daily_subtasks" DROP CONSTRAINT "daily_subtasks_dailyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dailys" DROP CONSTRAINT "dailys_userId_fkey";

-- AlterTable
ALTER TABLE "public"."daily_logs" ADD COLUMN     "periodId" TEXT;

-- AlterTable
ALTER TABLE "public"."habits" ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'Média',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Em Andamento',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."dailys";

-- CreateTable
CREATE TABLE "public"."habit_periods" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "count" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."habit_entries" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dailies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "observations" TEXT NOT NULL DEFAULT '',
    "tasks" TEXT[],
    "difficulty" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "repeatType" TEXT NOT NULL,
    "repeatFrequency" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedDate" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dailies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_periods" (
    "id" TEXT NOT NULL,
    "dailyId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_periods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."habit_periods" ADD CONSTRAINT "habit_periods_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_entries" ADD CONSTRAINT "habit_entries_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_entries" ADD CONSTRAINT "habit_entries_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."habit_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dailies" ADD CONSTRAINT "dailies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_subtasks" ADD CONSTRAINT "daily_subtasks_dailyId_fkey" FOREIGN KEY ("dailyId") REFERENCES "public"."dailies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_periods" ADD CONSTRAINT "daily_periods_dailyId_fkey" FOREIGN KEY ("dailyId") REFERENCES "public"."dailies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_logs" ADD CONSTRAINT "daily_logs_dailyId_fkey" FOREIGN KEY ("dailyId") REFERENCES "public"."dailies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
