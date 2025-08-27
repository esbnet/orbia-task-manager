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
}
