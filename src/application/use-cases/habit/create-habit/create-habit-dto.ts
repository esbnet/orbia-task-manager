export type HabitDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type HabitReset = "Diariamente" | "Semanalmente" | "Mensalmente";
export type HabitStatus = "Em Andamento" | "Completo" | "Cancelado";
export type HabitPriority = "Baixa" | "Média" | "Alta" | "Urgente";
export type HabitCategory = "Pessoa" | "Trabalho" | "Saúde" | "Aprendizado";

export type CreateHabitInput = {
	title: string;
	observations: string;
	difficulty: HabitDifficulty;
	priority: HabitPriority;
	category: HabitCategory;
	tags: string[];
	reset: HabitReset;
	createdAt: Date;
};

export type CreateHabitOutput = {
	habit: {
		id: string;
		title: string;
		observations: string;
		difficulty: HabitDifficulty;
		status: HabitStatus;
		priority: HabitPriority;
		category: HabitCategory;
		tags: string[];
		reset: HabitReset;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
		order?: number;
	};
};
