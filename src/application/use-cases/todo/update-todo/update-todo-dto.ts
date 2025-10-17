export type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type TodoRecurrence = "none" | "daily" | "weekly" | "monthly" | "custom";
export type TodoType = "pontual" | "recorrente";

export type TodoReset = "Diária" | "Semanal" | "Mensal";

export type UpdateTodoInput = {
	id: string;
	userId: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: TodoDifficulty;
	startDate: Date;
	tags: string[];
	createdAt: Date;
	recurrence: TodoRecurrence;
	recurrenceInterval?: number;
	todoType: TodoType;
};

export type UpdateTodoOutput = {
	id: string;
	userId: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: TodoDifficulty;
	startDate: Date;
	tags: string[];
	createdAt: Date;
	recurrence: TodoRecurrence;
	recurrenceInterval?: number;
	todoType: TodoType;
};
