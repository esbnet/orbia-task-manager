import { PrismaGoalRepository } from "@/infra/database/prisma/prisma-goal-repository";
import type { GoalRepository } from "./repository";
import type {
    CreateGoalInput,
    Goal,
    GoalAttachedTask,
    ListGoalsInput,
    UpdateGoalInput,
} from "./types";
import {
    attachTask,
    createGoal,
    deleteGoal,
    detachTask,
    getAttachedTasks,
    getGoalById,
    listGoals,
    updateAttachedTasks,
    updateGoal,
} from "./use-cases";

const _repo = new PrismaGoalRepository();

const goalRepo: GoalRepository = {
    findById(id) { return _repo.findById(id); },
    findByUserId(userId) { return _repo.findByUserId(userId); },
    findByStatus(status) { return _repo.findByStatus(status); },
    findByPriority(priority) { return _repo.findByPriority(priority); },
    findByTags(tags) { return _repo.findByTags(tags); },
    findDueSoon(days) { return _repo.findDueSoon(days); },
    create(data) { return _repo.create(data); },
    update(goal) { return _repo.update(goal); },
    delete(id) { return _repo.delete(id); },
    attachTask(goalId, taskId, taskType) { return _repo.attachTask(goalId, taskId, taskType); },
    detachTask(goalId, taskId, taskType) { return _repo.detachTask(goalId, taskId, taskType); },
    getAttachedTasks(goalId) { return _repo.getAttachedTasks(goalId); },
    updateAttachedTasks(goalId, tasks) { return _repo.updateAttachedTasks(goalId, tasks); },
};

export const GoalModule = {
    list(input: ListGoalsInput): Promise<Goal[]> {
        return listGoals(goalRepo, input);
    },
    create(input: CreateGoalInput): Promise<Goal> {
        return createGoal(goalRepo, input);
    },
    update(input: UpdateGoalInput): Promise<Goal> {
        return updateGoal(goalRepo, input);
    },
    delete(id: string): Promise<void> {
        return deleteGoal(goalRepo, id);
    },
    findById(id: string): Promise<Goal | null> {
        return getGoalById(goalRepo, id);
    },
    getAttachedTasks(goalId: string): Promise<GoalAttachedTask[]> {
        return getAttachedTasks(goalRepo, goalId);
    },
    attachTask(goalId: string, taskId: string, taskType: "habit" | "todo"): Promise<void> {
        return attachTask(goalRepo, goalId, taskId, taskType);
    },
    detachTask(goalId: string, taskId: string, taskType: "habit" | "todo"): Promise<void> {
        return detachTask(goalRepo, goalId, taskId, taskType);
    },
    updateAttachedTasks(
        goalId: string,
        tasks: Array<{ taskId: string; taskType: "habit" | "todo" }>,
    ): Promise<void> {
        return updateAttachedTasks(goalRepo, goalId, tasks);
    },
};

export type { GoalRepository } from "./repository";
export type {
    CreateGoalInput,
    Goal,
    GoalAttachedTask,
    GoalPriority,
    GoalStatus,
    ListGoalsInput,
    UpdateGoalInput
} from "./types";

