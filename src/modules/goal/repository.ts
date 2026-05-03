import type { Goal, GoalAttachedTask } from "./types";

export interface GoalRepository {
    findById(id: string): Promise<Goal | null>;
    findByUserId(userId: string): Promise<Goal[]>;
    findByStatus(status: Goal["status"]): Promise<Goal[]>;
    findByPriority(priority: Goal["priority"]): Promise<Goal[]>;
    findByTags(tags: string[]): Promise<Goal[]>;
    findDueSoon(days: number): Promise<Goal[]>;
    create(data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal>;
    update(goal: Goal): Promise<Goal>;
    delete(id: string): Promise<void>;
    attachTask(goalId: string, taskId: string, taskType: "habit" | "todo"): Promise<void>;
    detachTask(goalId: string, taskId: string, taskType: "habit" | "todo"): Promise<void>;
    getAttachedTasks(goalId: string): Promise<GoalAttachedTask[]>;
    updateAttachedTasks(
        goalId: string,
        tasks: Array<{ taskId: string; taskType: "habit" | "todo" }>,
    ): Promise<void>;
}
