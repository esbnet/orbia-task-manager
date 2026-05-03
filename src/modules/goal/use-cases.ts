import type { GoalRepository } from "./repository";
import type {
    CreateGoalInput,
    Goal,
    GoalAttachedTask,
    ListGoalsInput,
    UpdateGoalInput,
} from "./types";

export async function listGoals(
    repo: GoalRepository,
    input: ListGoalsInput,
): Promise<Goal[]> {
    if (input.status) return repo.findByStatus(input.status);
    if (input.priority) return repo.findByPriority(input.priority);
    if (input.tags && input.tags.length > 0) return repo.findByTags(input.tags);
    if (input.includeDueSoon) return repo.findDueSoon(input.dueSoonDays ?? 7);
    return repo.findByUserId(input.userId);
}

export async function createGoal(
    repo: GoalRepository,
    input: CreateGoalInput,
): Promise<Goal> {
    const goal = await repo.create({
        title: input.title,
        description: input.description ?? "",
        targetDate: input.targetDate,
        status: "IN_PROGRESS",
        priority: input.priority ?? "MEDIUM",
        tags: input.tags ?? [],
        userId: input.userId,
    });

    if (input.attachedTasks && input.attachedTasks.length > 0) {
        await repo.updateAttachedTasks(goal.id, input.attachedTasks);
    }

    return goal;
}

export async function updateGoal(
    repo: GoalRepository,
    input: UpdateGoalInput,
): Promise<Goal> {
    const current = await repo.findById(input.id);
    if (!current) throw new Error("Meta não encontrada");

    const updated = await repo.update({
        ...current,
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.targetDate !== undefined && { targetDate: input.targetDate }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.tags !== undefined && { tags: input.tags }),
        updatedAt: new Date(),
    });

    if (input.attachedTasks !== undefined) {
        await repo.updateAttachedTasks(input.id, input.attachedTasks);
    }

    return updated;
}

export async function deleteGoal(
    repo: GoalRepository,
    id: string,
): Promise<void> {
    return repo.delete(id);
}

export async function getGoalById(
    repo: GoalRepository,
    id: string,
): Promise<Goal | null> {
    return repo.findById(id);
}

export async function getAttachedTasks(
    repo: GoalRepository,
    goalId: string,
): Promise<GoalAttachedTask[]> {
    return repo.getAttachedTasks(goalId);
}

export async function attachTask(
    repo: GoalRepository,
    goalId: string,
    taskId: string,
    taskType: "habit" | "todo",
): Promise<void> {
    return repo.attachTask(goalId, taskId, taskType);
}

export async function detachTask(
    repo: GoalRepository,
    goalId: string,
    taskId: string,
    taskType: "habit" | "todo",
): Promise<void> {
    return repo.detachTask(goalId, taskId, taskType);
}

export async function updateAttachedTasks(
    repo: GoalRepository,
    goalId: string,
    tasks: Array<{ taskId: string; taskType: "habit" | "todo" }>,
): Promise<void> {
    return repo.updateAttachedTasks(goalId, tasks);
}
