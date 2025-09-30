import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Habit } from "@/domain/entities/habit";
import type { HabitFormData } from "@/types/habit";
import { taskCountKeys } from "./use-task-counts";

// Query keys para melhor organização
export const habitKeys = {
	all: ["habits"] as const,
	lists: () => [...habitKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...habitKeys.lists(), filters] as const,
	details: () => [...habitKeys.all, "detail"] as const,
	detail: (id: string) => [...habitKeys.details(), id] as const,
	available: () => [...habitKeys.all, "available"] as const,
};

// Hook para buscar todos os hábitos
export function useHabits() {
	return useQuery({
		queryKey: habitKeys.lists(),
		queryFn: async (): Promise<Habit[]> => {
			const response = await fetch("/api/habits");
			if (!response.ok) {
				throw new Error("Erro ao buscar hábitos");
			}
			const data = await response.json();
			return data.habits || [];
		},
		staleTime: 30 * 1000, // 30 segundos
		refetchOnWindowFocus: true,
	});
}

// Hook para buscar um hábito específico
export function useHabit(id: string) {
	return useQuery({
		queryKey: habitKeys.detail(id),
		queryFn: async (): Promise<Habit | null> => {
			const response = await fetch(`/api/habits/${id}`);
			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error("Erro ao buscar hábito");
			}
			const data = await response.json();
			return data.habit || null;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

// Hook para buscar hábitos disponíveis
export function useAvailableHabits() {
	return useQuery({
		queryKey: habitKeys.available(),
		queryFn: async (): Promise<{ availableHabits: Habit[]; completedInCurrentPeriod: Array<Habit & { nextAvailableAt: Date }>; totalHabits: number }> => {
			const response = await fetch("/api/habits/available");
			if (!response.ok) {
				throw new Error("Erro ao buscar hábitos disponíveis");
			}
			const data = await response.json();
			return {
				availableHabits: data.availableHabits || [],
				completedInCurrentPeriod: data.completedInCurrentPeriod || [],
				totalHabits: data.totalHabits || 0
			};
		},
		staleTime: 1 * 60 * 1000, // 1 minuto
	});
}

// Hook para criar hábito
export function useCreateHabit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: HabitFormData): Promise<Habit> => {
			const response = await fetch("/api/habits", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Erro ao criar hábito");
			}

			const result = await response.json();
			return result.habit;
		},
		onSuccess: () => {
			// Invalidate e refetch da lista de hábitos
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			// Invalidate hábitos disponíveis
			queryClient.invalidateQueries({ queryKey: habitKeys.available() });
			// Invalidate tarefas do dia para atualizar coração
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			// Invalidate cache de contagens de tarefas para atualizar badges de filtro
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			// Invalidate cache de metas para atualizar tarefas disponíveis
			queryClient.invalidateQueries({ queryKey: ["goals"] });
			// Invalidate cache de tarefas anexadas
			queryClient.invalidateQueries({ queryKey: ["attached-tasks"] });
			// Invalidate cache de tarefas ativas para atualizar lista no formulário de metas
			queryClient.invalidateQueries({ queryKey: ["active-tasks"] });
		},
	});
}

// Hook para atualizar hábito
export function useUpdateHabit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<Habit>;
		}): Promise<Habit> => {
			const response = await fetch(`/api/habits/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ habit: data }),
			});

			if (!response.ok) {
				throw new Error("Erro ao atualizar hábito");
			}

			const result = await response.json();
			return result.habit;
		},
		onSuccess: (data, variables) => {
			// Update cache do hábito específico
			queryClient.setQueryData(habitKeys.detail(variables.id), data);
			// Invalidate lista
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			// Invalidate hábitos disponíveis para refletir mudanças de status
			queryClient.invalidateQueries({ queryKey: habitKeys.available() });
			// Invalidate tarefas do dia para atualizar coração
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			// Invalidate cache de contagens de tarefas para atualizar badges de filtro
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
		},
	});
}

// Hook para deletar hábito
export function useDeleteHabit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/habits?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erro ao deletar hábito");
			}
		},
		onSuccess: (_, id) => {
			// Remove do cache
			queryClient.removeQueries({ queryKey: habitKeys.detail(id) });
			// Invalidate lista
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			// Invalidate tarefas do dia para atualizar coração
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			// Invalidate cache de contagens de tarefas para atualizar badges de filtro
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
		},
	});
}

// Hook para completar hábito
export function useCompleteHabit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<Habit> => {
			const response = await fetch(`/api/habits/${id}/complete`, {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Erro ao completar hábito");
			}

			const result = await response.json();
			return result.habit;
		},
		onSuccess: (data, id) => {
			// Update cache
			queryClient.setQueryData(habitKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			// Invalidate tarefas do dia para atualizar coração
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			// Invalidate cache de contagens de tarefas
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			// Invalidate cache do gráfico de evolução semanal
			queryClient.invalidateQueries({ queryKey: ["weekly-evolution"] });
		},
	});
}

// Hook para registrar execução de hábito
export function useRegisterHabit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			note,
		}: {
			id: string;
			note?: string;
		}): Promise<{
			currentCount: number;
			periodCount: number;
			todayCount: number;
			message: string;
		}> => {
			const response = await fetch(`/api/habits/${id}/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ note }),
			});

			if (!response.ok) {
				throw new Error("Erro ao registrar execução do hábito");
			}

			const result = await response.json();
			return result;
		},
		onSuccess: (_, variables) => {
			// Invalidate queries relacionadas ao hábito para atualizar estatísticas
			queryClient.invalidateQueries({ queryKey: habitKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
			queryClient.invalidateQueries({ queryKey: habitKeys.available() });
			// Invalidate tarefas do dia para atualizar coração
			queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
			// Invalidate cache de contagens de tarefas
			queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
			// Invalidate cache do gráfico de evolução semanal
			queryClient.invalidateQueries({ queryKey: ["weekly-evolution"] });
		},
	});
}
