type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
type TodoRecurrence = "none" | "daily" | "weekly" | "monthly" | "custom";

export interface Todo {
	id: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: TodoDifficulty;
	startDate: Date;
	tags: string[];
	createdAt: Date;
	order?: number;
	userId: string;
	lastCompletedDate?: string;
	recurrence: TodoRecurrence;
	recurrenceInterval?: number;
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
