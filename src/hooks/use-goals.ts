import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { InputSanitizer } from "@/infra/validation/input-sanitizer";
import type { Goal } from "@/types";
import { useAuthenticatedApi } from "./use-authenticated-api";
import { useSound } from "./use-sound";
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
	const { isAuthenticated } = useAuthenticatedApi();
	const safeStatus = status ? InputSanitizer.sanitizeForLog(status) : 'none';
	const queryKey = status ? ["goals", status] : ["goals"];

	return useQuery({
		queryKey,
		queryFn: async (): Promise<Goal[]> => {
			const url = status ? `/api/goals?status=${status}` : '/api/goals';
			const safeUrl = InputSanitizer.sanitizeForLog(url);
			const response = await fetch(url);
			if (!response.ok) throw new Error("Erro ao buscar goals");
			const data = await response.json();
			return Array.isArray(data) ? data : (data.goals || []);
		},
		enabled: isAuthenticated,
		staleTime: 2 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
}

// Hook para buscar um goal específico
export function useGoal(id: string) {
	const { isAuthenticated } = useAuthenticatedApi();
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
				const safeData = InputSanitizer.sanitizeForLog(JSON.stringify(data));
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
		enabled: isAuthenticated && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

// Hook para criar goal
export function useCreateGoal() {
	const queryClient = useQueryClient();
	const { playCreate } = useSound();
	const { assertAuthenticated } = useAuthenticatedApi();

	return useMutation({
		mutationFn: async (data: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> => {
			assertAuthenticated();
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
			playCreate();
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
	const { playUpdate } = useSound();
	const { assertAuthenticated } = useAuthenticatedApi();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }): Promise<Goal> => {
			assertAuthenticated();
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
			playUpdate();
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
	const { playDelete } = useSound();
	const { assertAuthenticated } = useAuthenticatedApi();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			assertAuthenticated();
			const response = await fetch(`/api/goals/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erro ao deletar goal");
			}
		},
		onSuccess: (_, id) => {
			playDelete();
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
