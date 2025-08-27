export type TodoDificult = "Trivial" | "Fácil" | "Médio" | "Difícil";

export type ListTodosOutput = {
	todos: {
		id: string;
		title: string;
		observations: string;
		tasks: string[];
		startDate: Date;
		difficulty: TodoDificult;
		tags: string[];
		createdAt: Date;
	}[];
};

export type ListTodosInput = {
	page: number;
	limit: number;
};
