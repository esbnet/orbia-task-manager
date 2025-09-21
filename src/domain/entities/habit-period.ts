export interface HabitPeriod {
	id: string;
	habitId: string;
	periodType: "Diariamente" | "Semanalmente" | "Mensalmente";
	startDate: Date;
	endDate?: Date;
	count: number;
	target?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateHabitPeriodData {
	habitId: string;
	periodType: "Diariamente" | "Semanalmente" | "Mensalmente";
	startDate: Date;
	target?: number;
}

export interface UpdateHabitPeriodData {
	endDate?: Date;
	count?: number;
	target?: number;
	isActive?: boolean;
}
