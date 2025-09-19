import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Daily } from "@/types";

// Query keys para dailies
export const dailyKeys = {
	all: ["dailies"] as const,
	lists: () => [...dailyKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...dailyKeys.lists(), filters] as const,
	details: () => [...dailyKeys.all, "detail"] as const,
	detail: (id: string) => [...dailyKeys.details(), id] as const,
};

// Hook para buscar todos os dailies
export function useDailies() {
	return useQuery({
		queryKey: dailyKeys.lists(),
		queryFn: async (): Promise<Daily[]> => {
			const response = await fetch("/api/dailies");
			if (!response.ok) {
				throw new Error("Erro ao buscar dailies");
			}
			const data = await response.json();
			return data.dailies || [];
		},
		staleTime: 2 * 60 * 1000, // 2 minutos
	});
}

// Hook para buscar dailies disponíveis
export function useAvailableDailies() {
	return useQuery({
		queryKey: [...dailyKeys.lists(), "available"],
		queryFn: async (): Promise<{ availableDailies: Daily[]; completedToday: Daily[] }> => {
			// console.log('useAvailableDailies: Executando query');
			const response = await fetch("/api/dailies/available");
			if (!response.ok) {
				throw new Error("Erro ao buscar dailies disponíveis");
			}
			const data = await response.json();
			// console.log('useAvailableDailies: Dados retornados', {
			// 	availableCount: data.availableDailies?.length || 0,
			// 	completedCount: data.completedToday?.length || 0
			// });
			return {
				availableDailies: data.availableDailies || [],
				completedToday: data.completedToday || []
			};
		},
		staleTime: 1 * 60 * 1000, // 1 minuto
	});
}

// Hook para buscar um daily específico
export function useDaily(id: string) {
	return useQuery({
		queryKey: dailyKeys.detail(id),
		queryFn: async (): Promise<Daily | null> => {
			const response = await fetch(`/api/dailies/${id}`);
			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error("Erro ao buscar daily");
			}
			const data = await response.json();
			return data.daily || null;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

// Hook para completar daily
export function useCompleteDaily() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<Daily> => {
			const response = await fetch(`/api/dailies/${id}/complete`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Erro ao completar daily");
			}

			const result = await response.json();
			// Buscar o daily atualizado após completar
			const dailyResponse = await fetch(`/api/daily/${id}`);
			if (dailyResponse.ok) {
				const dailyData = await dailyResponse.json();
				return dailyData.daily;
			}
			throw new Error("Erro ao buscar daily atualizado");
		},
		onSuccess: (data, id) => {
			// Invalidate imediatamente todas as queries de dailies
			queryClient.invalidateQueries({ queryKey: dailyKeys.all });
			// Força refetch da query de dailies disponíveis
			queryClient.refetchQueries({ queryKey: [...dailyKeys.lists(), "available"] });
		},
	});
}

// Hook para criar daily
export function useCreateDaily() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Omit<Daily, "id" | "createdAt">): Promise<Daily> => {
			const response = await fetch("/api/daily", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Erro ao criar daily");
			}

			const result = await response.json();
			return result.daily;
		},
		onSuccess: () => {
			// Invalidate all daily queries
			queryClient.invalidateQueries({ queryKey: dailyKeys.all });
			// Invalidate cache de metas para atualizar tarefas disponíveis
			queryClient.invalidateQueries({ queryKey: ["goals"] });
			// Invalidate cache de tarefas anexadas
			queryClient.invalidateQueries({ queryKey: ["attached-tasks"] });
			// Invalidate cache de tarefas ativas para atualizar lista no formulário de metas
			queryClient.invalidateQueries({ queryKey: ["active-tasks"] });
		},
	});
}

// Hook para atualizar daily
export function useUpdateDaily() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Daily> }): Promise<Daily> => {
			// console.log('useUpdateDaily: Iniciando atualização', { id, data });
			const response = await fetch(`/api/daily/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Erro ao atualizar daily");
			}

			const result = await response.json();
			// console.log('useUpdateDaily: Atualização bem-sucedida', result.daily);
			return result.daily;
		},
		onSuccess: (data, { id }) => {
			// console.log('useUpdateDaily: onSuccess - Invalidando cache');
			// Update cache
			queryClient.setQueryData(dailyKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: dailyKeys.lists() });
			// console.log('useUpdateDaily: Cache invalidado');
		},
	});
}

// Hook para deletar daily
export function useDeleteDaily() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/daily/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erro ao deletar daily");
			}
		},
		onSuccess: (_, id) => {
			// Remove from cache
			queryClient.removeQueries({ queryKey: dailyKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: dailyKeys.lists() });
		},
	});
}