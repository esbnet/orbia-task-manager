import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Goal } from "@/types";
import { taskCountKeys } from "./use-task-counts";

// Query keys para goals
export const goalKeys = {
	all: ["goals"] as const,
	lists: () => [...goalKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...goalKeys.lists(), filters] as const,
	details: () => [...goalKeys.all, "detail"] as const,
	detail: (id: string) => [...goalKeys.details(), id] as const,
};

// Hook para buscar todos os goals
export function useGoals(status?: string) {
	return useQuery({
		queryKey: goalKeys.list({ status }),
		enabled: true, // Force enable
		queryFn: async (): Promise<Goal[]> => {
			const params = new URLSearchParams();
			if (status) {
				params.append('status', status);
			}
			const url = `/api/goals${params.toString() ? `?${params.toString()}` : ''}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Erro ao buscar goals");
			}
			const data = await response.json();

			// Debug: verificar estrutura da resposta
			if (process.env.NODE_ENV === 'development') {
				console.log('[USE-GOALS] 📡 Resposta da API:', data);
				console.log('[USE-GOALS] 📡 Tipo da resposta:', typeof data);
				console.log('[USE-GOALS] 📡 É array?', Array.isArray(data));
			}

			// A API pode retornar array diretamente ou objeto com propriedade goals
			if (Array.isArray(data)) {
				if (process.env.NODE_ENV === 'development') {
					console.log('[USE-GOALS] ✅ API retornou array diretamente:', data.length, 'metas');
				}
				return data;
			} else if (data.goals && Array.isArray(data.goals)) {
				if (process.env.NODE_ENV === 'development') {
					console.log('[USE-GOALS] ✅ API retornou objeto com goals:', data.goals.length, 'metas');
				}
				return data.goals;
			} else {
				if (process.env.NODE_ENV === 'development') {
					console.log('[USE-GOALS] ❌ Estrutura inesperada:', Object.keys(data));
				}
				return [];
			}
		},
		staleTime: 0, // Force fresh data
		gcTime: 0, // No cache
		refetchOnWindowFocus: true,
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

			// Debug: verificar estrutura da resposta
			if (process.env.NODE_ENV === 'development') {
				console.log('[USE-GOAL] 📡 Resposta da API para goal específico:', data);
			}

			// A API pode retornar objeto diretamente ou com propriedade goal
			if (data && typeof data === 'object' && 'id' in data) {
				return data as Goal;
			} else if (data.goal) {
				return data.goal;
			} else {
				return null;
			}
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

			// Invalidate cache de contagens de tarefas com prioridade alta
			queryClient.invalidateQueries({
				queryKey: taskCountKeys.counts(),
				refetchType: 'active' // Força refetch imediato
			});

			// Invalidate cache de tarefas de hoje com prioridade alta
			queryClient.invalidateQueries({
				queryKey: ["today-tasks"],
				refetchType: 'active' // Força refetch imediato
			});
		},
	});
}

// Hook para atualizar goal
export function useUpdateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }): Promise<Goal> => {
			const response = await fetch(`/api/goals/${id}`, {
				method: "PUT",
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

			// Invalidate cache de contagens de tarefas com prioridade alta
			queryClient.invalidateQueries({
				queryKey: taskCountKeys.counts(),
				refetchType: 'active' // Força refetch imediato
			});

			// Invalidate cache de tarefas de hoje com prioridade alta
			queryClient.invalidateQueries({
				queryKey: ["today-tasks"],
				refetchType: 'active' // Força refetch imediato
			});

			// Invalidate cache do gráfico de evolução semanal
			queryClient.invalidateQueries({ queryKey: ["weekly-evolution"] });
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

			// Invalidate cache de contagens de tarefas com prioridade alta
			queryClient.invalidateQueries({
				queryKey: taskCountKeys.counts(),
				refetchType: 'active' // Força refetch imediato
			});

			// Invalidate cache de tarefas de hoje com prioridade alta
			queryClient.invalidateQueries({
				queryKey: ["today-tasks"],
				refetchType: 'active' // Força refetch imediato
			});
		},
	});
}