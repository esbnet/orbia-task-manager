-- AlterTable
ALTER TABLE "public"."todos" ADD COLUMN     "recurrence" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "recurrenceInterval" INTEGER;
