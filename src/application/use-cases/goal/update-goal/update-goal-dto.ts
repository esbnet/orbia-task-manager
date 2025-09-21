export interface UpdateGoalDto {
	id: string;
	title?: string;
	description?: string;
	targetDate?: Date;
	priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	tags?: string[];
	attachedTasks?: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>;
}