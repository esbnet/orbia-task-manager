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
