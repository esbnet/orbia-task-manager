export type DailyDificult = "Trivial" | "Fácil" | "Médio" | "Difícil";

type DailyRepeatType =
	| "Diariamente"
	| "Semanalmente"
	| "Mensalmente"
	| "Anualmente";

type DailyRepeat = {
	type: DailyRepeatType;
	frequency: number;
};

export interface UpdateDailyInput {
	id: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: DailyDificult;
	startDate: Date;
	repeat: DailyRepeat;
	tags: string[];
	createdAt: Date;
}

export interface UpdateDailyOutput {
	daily: {
		id: string;
		title: string;
		observations: string;
		tasks: string[];
		difficulty: DailyDificult;
		startDate: Date;
		repeat: DailyRepeat;
		tags?: string[];
		createdAt: Date;
	};
}
