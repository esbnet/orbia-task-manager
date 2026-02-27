export type HabitDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type HabitReset = "Sempre disponível" | "Diariamente" | "Semanalmente" | "Mensalmente";
export type HabitStatus =
	| "Em Andamento"
	| "Completo"
	| "Cancelado"
	| "active"
	| "archived";
export type HabitPriority = "Baixa" | "Média" | "Alta" | "Urgente";

export type HabitOutput = {
	habit: {
		id: string;
		title: string;
		observations: string;
		difficulty: HabitDifficulty;
		status: HabitStatus;
		priority: HabitPriority;
		tags: string[];
		reset: HabitReset;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
		order?: number;
		lastCompletedDate?: string;
		currentPeriod: any;
		todayEntries: number;
	};
};
