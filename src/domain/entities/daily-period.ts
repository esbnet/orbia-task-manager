export interface DailyPeriod {
	id: string;
	dailyId: string;
	periodType: string;
	startDate: Date;
	endDate: Date | null;
	isCompleted: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateDailyPeriodData {
	dailyId: string;
	periodType: string;
	startDate: Date;
	endDate?: Date | null;
	isCompleted?: boolean;
	isActive?: boolean;
}

export interface UpdateDailyPeriodData {
	isCompleted?: boolean;
	endDate?: Date | null;
	isActive?: boolean;
}