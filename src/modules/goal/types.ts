export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Goal {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    status: GoalStatus;
    priority: GoalPriority;
    tags: string[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoalAttachedTask {
    id: string;
    taskId: string;
    taskType: "habit" | "todo";
    taskTitle: string;
    taskDifficulty: string;
}

export interface CreateGoalInput {
    title: string;
    description?: string;
    targetDate: Date;
    priority?: GoalPriority;
    tags?: string[];
    userId: string;
    attachedTasks?: Array<{ taskId: string; taskType: "habit" | "todo" }>;
}

export interface UpdateGoalInput {
    id: string;
    title?: string;
    description?: string;
    targetDate?: Date;
    priority?: GoalPriority;
    tags?: string[];
    attachedTasks?: Array<{ taskId: string; taskType: "habit" | "todo" }>;
}

export interface ListGoalsInput {
    userId: string;
    status?: GoalStatus;
    priority?: GoalPriority;
    tags?: string[];
    includeOverdue?: boolean;
    includeDueSoon?: boolean;
    dueSoonDays?: number;
}
