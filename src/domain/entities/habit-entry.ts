export interface HabitEntry {
	id: string;
	habitId: string;
	periodId: string;
	timestamp: Date;
	note?: string;
	createdAt: Date;
}

export interface CreateHabitEntryData {
	habitId: string;
	periodId: string;
	note?: string;
}

export interface HabitEntryWithPeriod extends HabitEntry {
	period: {
		id: string;
		periodType: string;
		startDate: Date;
		endDate?: Date;
		count: number;
		target?: number;
	};
}
