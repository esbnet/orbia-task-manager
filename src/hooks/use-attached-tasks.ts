import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "./use-authenticated-api";

export interface AttachedTask {
	id: string;
	taskId: string;
	taskType: "habit" | "todo";
	taskTitle: string;
	taskDifficulty: string;
}

// Hook para buscar tarefas anexadas a uma meta específica
export function useAttachedTasks(goalId?: string) {
	const { isAuthenticated } = useAuthenticatedApi();

	return useQuery({
		queryKey: ["attached-tasks", goalId],
		queryFn: async (): Promise<AttachedTask[]> => {
			if (!goalId) return [];


			const response = await fetch(`/api/goals/${goalId}/tasks`);

			if (!response.ok) {
				return [];
			}

			const data = await response.json();

			return data;
		},
		enabled: isAuthenticated && !!goalId, // Só executa se goalId estiver definido
		staleTime: 2 * 60 * 1000, // 2 minutos
		retry: 1,
	});
}
