export type TodoDifficulty = "Trivial" | "Fácil" | "Médio" | "Difícil";

export type TodoReset = "Diária" | "Semanal" | "Mensal";

export type TodoOutput = {
	todo: {
		id: string;
		title: string;
		observations: string;
		tasks: string[];
		difficulty: TodoDifficulty;
		startDate: Date;
		tags: string[];
		createdAt: Date;
	};
};
