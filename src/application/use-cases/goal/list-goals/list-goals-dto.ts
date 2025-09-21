export interface ListGoalsDto {
	userId: string;
	status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
	priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	category?: "PERSONAL" | "WORK" | "HEALTH" | "LEARNING";
	tags?: string[];
	includeOverdue?: boolean;
	includeDueSoon?: boolean;
	dueSoonDays?: number;
}
