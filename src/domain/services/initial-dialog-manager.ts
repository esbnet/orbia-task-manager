export interface DialogConfig {
	showInitialDialog: boolean;
	dialogEnabled: boolean;
}

export interface TaskCategory {
	id: string;
	title: string;
	type: "habit" | "daily" | "todo" | "goal";
	status: string;
	isOverdue: boolean;
	dueDate?: Date;
	category: string;
	lastCompletedDate?: string | null;
	todayEntries?: number;
}

export class InitialDialogManager {
	/**
	 * Verifica se o dialog inicial deve ser exibido baseado na configuração
	 */
	static shouldShowInitialDialog(config: { notifications: boolean }): boolean {
		return config.notifications === true;
	}

	/**
	 * Categoriza tarefas baseado no tipo e status
	 */
	static categorizeTasks(tasks: any[]): TaskCategory[] {
		return tasks.map(task => ({
			...task,
			category: this.getTaskCategory(task.type, task.status, task.isOverdue)
		}));
	}

	/**
	 * Determina a categoria de uma tarefa
	 */
	private static getTaskCategory(type: string, status: string, isOverdue: boolean): string {
		if (isOverdue) return "overdue";
		if (status === "IN_PROGRESS" || status === "Pendente" || status === "Ativa") return "pending";
		if (status === "Completa" || status === "Concluída") return "completed";
		return "other";
	}

	/**
	 * Filtra apenas tarefas do dia corrente
	 */
	static filterTodayTasks(tasks: TaskCategory[], currentDate: Date = new Date()): TaskCategory[] {
		const today = currentDate.toDateString();

		return tasks.filter(task => {
			// Para dailies, verificar se foi concluída hoje
			if (task.type === "daily") {
				const lastCompleted = task.lastCompletedDate ? new Date(task.lastCompletedDate).toDateString() : null;
				return !lastCompleted || lastCompleted !== today;
			}

			// Para habits, verificar se tem entrada hoje
			if (task.type === "habit") {
				return task.todayEntries === 0;
			}

			// Para todos e goals, verificar se estão pendentes
			if (task.type === "todo" || task.type === "goal") {
				return task.status === "Pendente" || task.status === "IN_PROGRESS";
			}

			return true;
		});
	}

	/**
	 * Organiza tarefas por categoria
	 */
	static groupTasksByCategory(tasks: TaskCategory[]): Record<string, TaskCategory[]> {
		return tasks.reduce((groups, task) => {
			const category = task.category;
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(task);
			return groups;
		}, {} as Record<string, TaskCategory[]>);
	}
}