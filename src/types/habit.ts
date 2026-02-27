export type HabitDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";

// Hábitos não têm mais frequência fixa; mantemos string para compatibilidade
export type HabitReset = "Sempre disponível" | "Diariamente" | "Semanalmente" | "Mensalmente";

export type HabitStatus =
	| "Em Andamento"
	| "Completo"
	| "Cancelado"
	| "active"
	| "archived";

export type HabitPriority = "Baixa" | "Média" | "Alta" | "Urgente";

export type HabitCategory = "Pessoa" | "Trabalho" | "Saúde" | "Aprendizado";

export interface Habit {
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
	lastCompletedDate?: string;
}

export interface HabitFormData {
	id?: string;
	userId: string;
	title: string;
	observations: string;
	difficulty: HabitDifficulty;
	priority: HabitPriority;
	tags: string[];
	reset: HabitReset;
}
