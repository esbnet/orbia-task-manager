import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Todo } from "@/types";

// Query keys para todos
export const todoKeys = {
	all: ["todos"] as const,
	lists: () => [...todoKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...todoKeys.lists(), filters] as const,
	details: () => [...todoKeys.all, "detail"] as const,
	detail: (id: string) => [...todoKeys.details(), id] as const,
};

// Hook para buscar todos os todos
export function useTodos() {
	return useQuery({
		queryKey: todoKeys.lists(),
		queryFn: async (): Promise<Todo[]> => {
			const response = await fetch("/api/todos");
			if (!response.ok) {
				throw new Error("Erro ao buscar todos");
			}
			const data = await response.json();
			return data.todos || [];
		},
		staleTime: 2 * 60 * 1000, // 2 minutos
	});
}

// Hook para buscar um todo específico
export function useTodo(id: string) {
	return useQuery({
		queryKey: todoKeys.detail(id),
		queryFn: async (): Promise<Todo | null> => {
			const response = await fetch(`/api/todos/${id}`);
			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error("Erro ao buscar todo");
			}
			const data = await response.json();
			return data.todo || null;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

// Hook para completar todo
export function useCompleteTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<Todo> => {
			const response = await fetch(`/api/todos/${id}/complete`, {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Erro ao completar todo");
			}

			const result = await response.json();
			return result.todo;
		},
		onSuccess: (data, id) => {
			// Update cache
			queryClient.setQueryData(todoKeys.detail(id), data);
			queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
		},
	});
}