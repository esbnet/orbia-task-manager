export type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";
export type TodoRecurrence = "none" | "daily" | "weekly" | "monthly" | "custom";
export type TodoType = "pontual" | "recorrente";

export type TodoReset = "Diária" | "Semanal" | "Mensal";

export type CreateTodoInput = {
	userId: string;
	title: string;
	observations: string;
	tasks: string[];
	difficulty: TodoDifficulty;
	startDate: Date;
	tags: string[];
	createdAt: Date;
	recurrence?: TodoRecurrence;
	todoType?: TodoType;
};

export type CreateTodoOutput = {
	todo: {
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
		todoType: TodoType;
	};
};
