export interface CreateGoalDto {
	title: string;
	description?: string;
	targetDate: Date;
	priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	category?: "PERSONAL" | "WORK" | "HEALTH" | "LEARNING";
	tags?: string[];
	userId: string;
}
