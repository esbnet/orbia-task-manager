export interface DailyLog {
	id: string;
	dailyId: string;
	periodId?: string;
	dailyTitle: string;
	difficulty: string;
	tags: string[];
	status: "success" | "fail";
	completedAt: Date;
	createdAt: Date;
}
