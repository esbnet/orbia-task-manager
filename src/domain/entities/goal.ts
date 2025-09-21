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

export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type GoalCategory = "PERSONAL" | "WORK" | "HEALTH" | "LEARNING";

export interface GoalAttachedTask {
	id: string;
	taskId: string;
	taskType: "habit" | "daily" | "todo";
	taskTitle: string;
	taskDifficulty: string;
}
