-- AlterTable
ALTER TABLE "habits" ALTER COLUMN "status" SET DEFAULT 'active';

-- CreateIndex
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- CreateIndex
CREATE INDEX "habit_entries_habitId_idx" ON "habit_entries"("habitId");

-- CreateIndex
CREATE INDEX "habit_logs_habitId_idx" ON "habit_logs"("habitId");

-- CreateIndex
CREATE INDEX "habit_periods_habitId_idx" ON "habit_periods"("habitId");

-- CreateIndex
CREATE INDEX "habits_userId_idx" ON "habits"("userId");

-- CreateIndex
CREATE INDEX "todo_logs_todoId_idx" ON "todo_logs"("todoId");

-- CreateIndex
CREATE INDEX "todos_userId_idx" ON "todos"("userId");
