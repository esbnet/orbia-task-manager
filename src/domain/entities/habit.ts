export type HabitDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type HabitReset = "Diariamente" | "Semanalmente" | "Mensalmente";
export type HabitStatus = "Em Andamento" | "Completo" | "Cancelado";
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
	currentPeriod: any;
	todayEntries: number;
}
