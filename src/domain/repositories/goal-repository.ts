import type { Goal, GoalAttachedTask } from "../entities/goal";
import type {
	PriorityRepository,
	TaggableRepository,
	UserOwnedDateQueryRepository,
	UserOwnedStatusRepository
} from "./base-repository";

// Goal repository with all necessary functionality
export interface GoalRepository
	extends UserOwnedStatusRepository<Goal, Goal["status"]>,
		PriorityRepository<Goal, Goal["priority"]>,
		TaggableRepository<Goal>,
		UserOwnedDateQueryRepository<Goal> {
	// Goal-specific methods for attached tasks
	attachTask(goalId: string, taskId: string, taskType: "habit" | "daily" | "todo"): Promise<void>;
	detachTask(goalId: string, taskId: string, taskType: "habit" | "daily" | "todo"): Promise<void>;
	getAttachedTasks(goalId: string): Promise<GoalAttachedTask[]>;
	updateAttachedTasks(goalId: string, tasks: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>): Promise<void>;
}
