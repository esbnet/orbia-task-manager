import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Goal } from "@/types";

// Query keys para goals
export const goalKeys = {
	all: ["goals"] as const,
	lists: () => [...goalKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...goalKeys.lists(), filters] as const,
	details: () => [...goalKeys.all, "detail"] as const,
	detail: (id: string) => [...goalKeys.details(), id] as const,
};

// Hook para buscar todos os goals
export function useGoals() {
	return useQuery({
		queryKey: goalKeys.lists(),
		queryFn: async (): Promise<Goal[]> => {
			const response = await fetch("/api/goals");
			if (!response.ok) {
				throw new Error("Erro ao buscar goals");
			}
			const data = await response.json();
			return data.goals || [];
		},
		staleTime: 2 * 60 * 1000, // 2 minutos
	});
}

// Hook para buscar um goal específico
export function useGoal(id: string) {
	return useQuery({
		queryKey: goalKeys.detail(id),
		queryFn: async (): Promise<Goal | null> => {
			const response = await fetch(`/api/goals/${id}`);
			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error("Erro ao buscar goal");
			}
			const data = await response.json();
			return data.goal || null;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

// Hook para criar goal
export function useCreateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> => {
			const response = await fetch("/api/goals", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Erro ao criar goal");
			}

			const result = await response.json();
			return result.goal;
		},
		onSuccess: () => {
			// Invalidate all goal queries
			queryClient.invalidateQueries({ queryKey: goalKeys.all });
		},
	});
}

// Hook para atualizar goal
export function useUpdateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }): Promise<Goal> => {
			const response = await fetch(`/api/goals/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Erro ao atualizar goal");
			}

			const result = await response.json();
			return result.goal;
		},
		onSuccess: (data, { id }) => {
			// Update cache
			queryClient.setQueryData(goalKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
}

// Hook para deletar goal
export function useDeleteGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/goals/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erro ao deletar goal");
			}
		},
		onSuccess: (_, id) => {
			// Remove from cache
			queryClient.removeQueries({ queryKey: goalKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
		},
	});
}