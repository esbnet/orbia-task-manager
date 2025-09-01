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
		queryFn: async (): Promise<Daily[]> => {
			const response = await fetch("/api/dailies/available");
			if (!response.ok) {
				throw new Error("Erro ao buscar dailies disponíveis");
			}
			const data = await response.json();
			return data.dailies || [];
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
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Erro ao completar daily");
			}

			const result = await response.json();
			return result.daily;
		},
		onSuccess: (data, id) => {
			// Update cache
			queryClient.setQueryData(dailyKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: dailyKeys.lists() });
		},
	});
}