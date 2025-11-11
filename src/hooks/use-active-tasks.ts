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
			console.log("🔍 Buscando tarefas ativas via API unificada...");

			try {
				const response = await fetch("/api/active-tasks");

				console.log("📡 Status da resposta:", InputSanitizer.sanitizeForLog(String(response.status)));

				if (!response.ok) {
					throw new Error(`Erro na API: ${response.status}`);
				}

				const data = await response.json();
				console.log("📦 Dados recebidos:", InputSanitizer.sanitizeForLog(JSON.stringify(data)));

				const tasks: ActiveTask[] = data.tasks || [];
				console.log("✅ Tarefas ativas encontradas:", InputSanitizer.sanitizeForLog(String(tasks.length)));

				return tasks;
			} catch (error) {
				console.error("❌ Erro ao buscar tarefas ativas:", error);
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