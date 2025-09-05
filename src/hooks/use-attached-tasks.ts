import { useQuery } from "@tanstack/react-query";

export interface AttachedTask {
	id: string;
	taskId: string;
	taskType: "habit" | "daily" | "todo";
	taskTitle: string;
	taskDifficulty: string;
}

// Hook para buscar tarefas anexadas a uma meta específica
export function useAttachedTasks(goalId?: string) {
	return useQuery({
		queryKey: ["attached-tasks", goalId],
		queryFn: async (): Promise<AttachedTask[]> => {
			if (!goalId) return [];

			console.log("🔍 Buscando tarefas anexadas à meta:", goalId);

			const response = await fetch(`/api/goals/${goalId}/tasks`);

			if (!response.ok) {
				console.error("Erro ao buscar tarefas anexadas:", response.status);
				return [];
			}

			const data = await response.json();
			console.log("✅ Tarefas anexadas encontradas:", data.length);

			return data;
		},
		enabled: !!goalId, // Só executa se goalId estiver definido
		staleTime: 2 * 60 * 1000, // 2 minutos
		retry: 1,
	});
}