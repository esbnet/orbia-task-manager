export interface DailyLog {
	id: string;
	dailyId: string;
	dailyTitle: string;
	difficulty: string;
	tags: string[];
	status?: "success" | "fail";
	completedAt: Date;
}
