-- AlterTable
ALTER TABLE "dailies" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
