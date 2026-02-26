import { useQuery } from "@tanstack/react-query";
import { InputSanitizer } from "@/infra/validation/input-sanitizer";

// Tipos para tarefas ativas
export interface ActiveTask {
	id: string;
	title: string;
	type: "habit" | "daily" | "todo";
	difficulty: string;
	icon: string;
}

// Query keys
export const activeTasksKeys = {
	all: ["active-tasks"] as const,
};

// Hook para buscar todas as tarefas ativas (habits, dailies, todos)
export function useActiveTasks() {
	return useQuery({
		queryKey: activeTasksKeys.all,
		queryFn: async (): Promise<ActiveTask[]> => {

			try {
				const response = await fetch("/api/active-tasks");


				if (!response.ok) {
					throw new Error(`Erro na API: ${response.status}`);
				}

				const data = await response.json();

				const tasks: ActiveTask[] = data.tasks || [];

				return tasks;
			} catch (error) {
				// Retorna array vazio em caso de erro para não quebrar a UI
				return [];
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutos
		gcTime: 10 * 60 * 1000, // 10 minutos
		retry: 1,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});
}