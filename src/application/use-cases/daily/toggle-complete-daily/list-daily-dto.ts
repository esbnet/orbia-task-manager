export type DailyDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";

type DailyRepeatType =
	| "Diariamente"
	| "Semanalmente"
	| "Mensalmente"
	| "Anualmente";

interface DailyRepeat {
	type: DailyRepeatType;
	frequency: number;
}

export type DailyOutput = {
	daily: {
		id: string;
		title: string;
		observations: string;
		tasks: string[];
		difficulty: DailyDifficulty;
		startDate: Date;
		repeat: DailyRepeat;
		tags: string[];
		createdAt: Date;
	};
};
