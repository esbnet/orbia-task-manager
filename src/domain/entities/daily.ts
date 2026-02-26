type DailyDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";

type DailyRepeatType =
	| "Diariamente"
	| "Semanalmente"
	| "Mensalmente"
	| "Anualmente";

type DailyRepeat = { type: DailyRepeatType; frequency: number };
type DailyStatus = "active" | "archived";

export interface Daily {
	id: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: DailyDifficulty;
	startDate: Date;
	repeat: DailyRepeat;
	tags: string[];
	createdAt: Date;
	order?: number;
	userId: string;
	lastCompletedDate?: string;
	status?: DailyStatus;
	subtasks?: DailySubtask[];
}

export interface DailySubtask {
	id: string;
	title: string;
	completed: boolean;
	dailyId: string;
	order: number;
	createdAt: Date;
}
