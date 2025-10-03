export type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type TodoRecurrence = "none" | "daily" | "weekly" | "monthly" | "custom";

export interface Todo {
	id: string;
	userId: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: TodoDifficulty;
	startDate: Date;
	tags: string[];
	createdAt: Date;
	order?: number;
	lastCompletedDate?: string;
	recurrence: TodoRecurrence;
	recurrenceInterval?: number; // Para recorrência customizada (ex: a cada 3 dias)
	subtasks?: TodoSubtask[];
}

export interface TodoSubtask {
	id: string;
	title: string;
	completed: boolean;
	todoId: string;
	order: number;
	createdAt: Date;
}
