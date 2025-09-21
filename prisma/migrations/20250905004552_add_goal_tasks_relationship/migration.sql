-- CreateTable
CREATE TABLE "public"."goal_tasks" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "goal_tasks_goalId_taskId_taskType_key" ON "public"."goal_tasks"("goalId", "taskId", "taskType");

-- AddForeignKey
ALTER TABLE "public"."goal_tasks" ADD CONSTRAINT "goal_tasks_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
