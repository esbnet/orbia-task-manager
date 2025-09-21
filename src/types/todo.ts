export type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";

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
