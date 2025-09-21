export interface Goal {
	id: string;
	userId: string;
	title: string;
	description: string;
	targetDate: Date;
	status: GoalStatus;
	priority: GoalPriority;
	category: GoalCategory;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type GoalCategory = "PERSONAL" | "WORK" | "HEALTH" | "LEARNING";

export interface GoalFormData {
	title: string;
	description: string;
	targetDate: Date;
	priority: GoalPriority;
	category: GoalCategory;
	tags: string[];
}

export interface GoalMilestone {
	id: string;
	title: string;
	description: string;
	targetDate: Date;
	completed: boolean;
	completedAt?: Date;
	order: number;
	goalId: string;
	createdAt: Date;
	updatedAt: Date;
}
