export type CompletePontualInput = {
	id: string;
};

export type CompletePontualOutput = {
	todo: {
		id: string;
		title: string;
		observations: string;
		tasks: string[];
		difficulty: "Trivial" | "Fácil" | "Médio" | "Difícil";
		startDate: Date;
		tags: string[];
		createdAt: Date;
		order?: number;
		userId: string;
		lastCompletedDate?: string;
		recurrence: "none" | "daily" | "weekly" | "monthly" | "custom";
		recurrenceInterval?: number;
		todoType: "pontual" | "recorrente";
		subtasks?: Array<{
			id: string;
			title: string;
			completed: boolean;
			todoId: string;
			order: number;
			createdAt: Date;
		}>;
	};
	log?: {
		id: string;
		todoId: string;
		todoTitle: string;
		difficulty: string;
		tags: string[];
		completedAt: Date;
	};
};