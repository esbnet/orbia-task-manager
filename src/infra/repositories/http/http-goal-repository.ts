import type { Goal } from "@/domain/entities/goal";
import type { GoalRepository } from "@/domain/repositories/goal-repository";

export class HttpGoalRepository implements GoalRepository {
	private baseUrl = "/api/goals";

	async list(): Promise<Goal[]> {
		const response = await fetch(this.baseUrl);
		if (!response.ok) {
			throw new Error("Erro ao carregar metas");
		}
		return response.json();
	}

	async create(data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Erro ao criar meta");
		}

		return response.json();
	}

	async update(goal: Goal): Promise<Goal> {
		const response = await fetch(`${this.baseUrl}/${goal.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(goal),
		});

		if (!response.ok) {
			throw new Error("Erro ao atualizar meta");
		}

		return response.json();
	}

	async delete(id: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error("Erro ao excluir meta");
		}
	}

	async updateStatus(id: string, status: Goal["status"]): Promise<Goal> {
		const response = await fetch(`${this.baseUrl}/${id}/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ status }),
		});

		if (!response.ok) {
			throw new Error("Erro ao atualizar status da meta");
		}

		return response.json();
	}

	async findById(id: string): Promise<Goal | null> {
		const response = await fetch(`${this.baseUrl}/${id}`);
		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error("Erro ao buscar meta");
		}
		return response.json();
	}

	async findByUserId(userId: string): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?userId=${userId}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas do usuário");
		}
		return response.json();
	}

	async deleteByUserId(userId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}?userId=${userId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error("Erro ao excluir metas do usuário");
		}
	}

	async findByStatus(status: Goal["status"]): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?status=${status}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas por status");
		}
		return response.json();
	}

	async findByUserIdAndStatus(userId: string, status: Goal["status"]): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?userId=${userId}&status=${status}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas do usuário por status");
		}
		return response.json();
	}

	async findByPriority(priority: Goal["priority"]): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?priority=${priority}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas por prioridade");
		}
		return response.json();
	}

	async updatePriority(id: string, priority: Goal["priority"]): Promise<Goal> {
		const response = await fetch(`${this.baseUrl}/${id}/priority`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ priority }),
		});

		if (!response.ok) {
			throw new Error("Erro ao atualizar prioridade da meta");
		}

		return response.json();
	}

	async findByTags(tags: string[]): Promise<Goal[]> {
		const tagsParam = tags.join(",");
		const response = await fetch(`${this.baseUrl}?tags=${tagsParam}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas por tags");
		}
		return response.json();
	}

	async findByTag(tag: string): Promise<Goal[]> {
		return this.findByTags([tag]);
	}

	async getTagStats(): Promise<Array<{ tag: string; count: number }>> {
		const response = await fetch(`${this.baseUrl}/tags/stats`);
		if (!response.ok) {
			throw new Error("Erro ao buscar estatísticas de tags das metas");
		}
		const json = await response.json();
		return json.tagStats || [];
	}

	async findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]> {
		const start = startDate.toISOString();
		const end = endDate.toISOString();
		const response = await fetch(`${this.baseUrl}?startDate=${start}&endDate=${end}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas por intervalo de datas");
		}
		return response.json();
	}

	async findOverdue(): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?overdue=true`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas vencidas");
		}
		return response.json();
	}

	async findDueSoon(days: number): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?dueSoon=${days}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas que vencem em breve");
		}
		return response.json();
	}

	async findOverdueByUserId(userId: string): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?userId=${userId}&overdue=true`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas vencidas do usuário");
		}
		return response.json();
	}

	async findDueSoonByUserId(userId: string, days: number): Promise<Goal[]> {
		const response = await fetch(`${this.baseUrl}?userId=${userId}&dueSoon=${days}`);
		if (!response.ok) {
			throw new Error("Erro ao buscar metas que vencem em breve do usuário");
		}
		return response.json();
	}

	async attachTask(goalId: string, taskId: string, taskType: "habit" | "daily" | "todo"): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${goalId}/tasks`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ taskId, taskType }),
		});

		if (!response.ok) {
			throw new Error("Erro ao anexar tarefa à meta");
		}
	}

	async detachTask(goalId: string, taskId: string, taskType: "habit" | "daily" | "todo"): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${goalId}/tasks/${taskId}?taskType=${taskType}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error("Erro ao remover tarefa da meta");
		}
	}

	async getAttachedTasks(goalId: string): Promise<import("@/domain/entities/goal").GoalAttachedTask[]> {
		const response = await fetch(`${this.baseUrl}/${goalId}/tasks`);
		if (!response.ok) {
			throw new Error("Erro ao buscar tarefas anexadas à meta");
		}
		return response.json();
	}

	async updateAttachedTasks(goalId: string, tasks: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>): Promise<void> {
		const response = await fetch(`${this.baseUrl}/${goalId}/tasks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ tasks }),
		});

		if (!response.ok) {
			throw new Error("Erro ao atualizar tarefas anexadas à meta");
		}
	}
}
