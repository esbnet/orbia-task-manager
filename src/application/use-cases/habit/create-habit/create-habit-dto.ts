export type HabitDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type HabitReset = "Sempre disponível" | "Diariamente" | "Semanalmente" | "Mensalmente";
export type HabitStatus =
	| "Em Andamento"
	| "Completo"
	| "Cancelado"
	| "active"
	| "archived";
export type HabitPriority = "Baixa" | "Média" | "Alta" | "Urgente";

export type CreateHabitInput = {
	userId: string;
	title: string;
	observations: string;
	difficulty: HabitDifficulty;
	priority: HabitPriority;
	tags: string[];
	reset: HabitReset;
	createdAt: Date;
};

export type CreateHabitOutput = {
	habit: {
		id: string;
		userId: string;
		title: string;
		observations: string;
		difficulty: HabitDifficulty;
		status: HabitStatus;
		priority: HabitPriority;
		tags: string[];
		reset: HabitReset;
		createdAt: Date;
		updatedAt: Date;
		order?: number;
		currentPeriod: any;
		todayEntries: number;
	};
};
