export interface DailyLog {
	id: string;
	dailyId: string;
	periodId?: string;
	dailyTitle: string;
	completedAt: Date;
	difficulty: string;
	tags: string[];
	createdAt: Date;
}
