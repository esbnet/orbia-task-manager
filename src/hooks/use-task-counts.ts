import { useQuery, useQueryClient } from "@tanstack/react-query";

// Tipos para melhor type safety
interface TaskCountsResponse {
  habits: number;
  dailies: number;
  todos: number;
  goals: number;
  total: number;
}

interface ApiError {
  message: string;
  status?: number;
}

// Query keys para contagens de tarefas
export const taskCountKeys = {
  all: ["task-counts"] as const,
  counts: () => [...taskCountKeys.all, "counts"] as const,
  detailed: () => [...taskCountKeys.all, "detailed"] as const,
};

// Interface para dados detalhados
export interface DetailedTaskCounts {
  habits: number;
  dailies: number;
  todos: number;
  todosCompleted: number;
  todosActive: number;
  goals: number;
  total: number;
  metadata?: {
    totalCompleted: number;
    totalActive: number;
    total: number;
  };
}

// Hook para invalidar contagens de tarefas
export function useInvalidateTaskCounts() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: taskCountKeys.counts() });
  };
}

// Hook para buscar contagens de tarefas por tipo
export function useTaskCounts() {
	return useQuery({
		queryKey: taskCountKeys.counts(),
		staleTime: 0, // Sempre considerar dados como stale para forçar refetch
		gcTime: 30 * 1000, // Manter cache por 30 segundos
		refetchOnWindowFocus: true,
		queryFn: async (): Promise<TaskCountsResponse> => {
			// Buscar contagens em paralelo
			const [habitsResponse, dailiesResponse, todosActiveResponse, goalsResponse] = await Promise.all([
				fetch("/api/habits/available"),
				fetch("/api/daily/available"),
				fetch("/api/todos"),
				fetch("/api/goals?status=IN_PROGRESS")
			]);

			// Verificar se todas as respostas são OK com tratamento de erro específico
			const responses = [
				{ name: "habits", response: habitsResponse },
				{ name: "dailies", response: dailiesResponse },
				{ name: "todosActive", response: todosActiveResponse },
				{ name: "goals", response: goalsResponse }
			];

			const failedRequests = responses.filter(({ response }) => !response.ok);

			if (failedRequests.length > 0) {
				const errorMessages = await Promise.all(
					failedRequests.map(async ({ name, response }) => {
						const errorData = await response.json().catch(() => ({}));
						return `${name}: ${response.status} - ${errorData.message || "Erro desconhecido"}`;
					})
				);

				throw new Error(`Falha ao buscar contagens: ${errorMessages.join(", ")}`);
			}

			// Extrair dados das respostas
			const [habitsData, dailiesData, todosActiveData, goalsData] = await Promise.all([
				habitsResponse.json(),
				dailiesResponse.json(),
				todosActiveResponse.json(),
				goalsResponse.json()
			]);

			// Calcular contagens com validação
			const habitsCount = habitsData?.availableHabits?.length || 0;
			const dailiesCount = dailiesData?.availableDailies?.length || 0;

			// Todos: contar apenas os ativos (não completados hoje)
			const todosActive = todosActiveData?.todos || [];
			const today = new Date().toISOString().split("T")[0];
			const todosActiveCount = todosActive.filter((todo: any) => todo.lastCompletedDate !== today).length;
			const todosCount = todosActiveCount;

			const goalsCount = Array.isArray(goalsData) ? goalsData.length : (goalsData?.goals?.length || 0);

			const total = habitsCount + dailiesCount + todosCount + goalsCount;

			// Log detalhado para debug

			return {
				habits: habitsCount,
				dailies: dailiesCount,
				todos: todosCount,
				goals: goalsCount,
				total
			};
		},
    retry: (failureCount, error) => {
      // Não retry para erros de autenticação (401, 403)
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
      // Retry até 2 vezes para outros erros
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook para buscar contagens detalhadas de tarefas
export function useDetailedTaskCounts() {
  return useQuery({
    queryKey: taskCountKeys.detailed(),
    queryFn: async (): Promise<DetailedTaskCounts> => {
      // Buscar contagens em paralelo
      const [habitsResponse, dailiesResponse, todosLogsResponse, todosActiveResponse, goalsResponse] = await Promise.all([
        fetch("/api/habits/available"),
        fetch("/api/daily/available"),
        fetch("/api/todos/logs/count"), // Logs dos todos completados
        fetch("/api/todos"), // Todos ativos
        fetch("/api/goals?status=IN_PROGRESS")
      ]);

      // Verificar se todas as respostas são OK
      if (!habitsResponse.ok || !dailiesResponse.ok || !todosLogsResponse.ok || !todosActiveResponse.ok || !goalsResponse.ok) {
        throw new Error("Erro ao buscar contagens detalhadas de tarefas");
      }

      // Extrair dados das respostas
      const [habitsData, dailiesData, todosLogsData, todosActiveData, goalsData] = await Promise.all([
        habitsResponse.json(),
        dailiesResponse.json(),
        todosLogsResponse.json(),
        todosActiveResponse.json(),
        goalsResponse.json()
      ]);

      // Calcular contagens
      const habitsCount = habitsData?.availableHabits?.length || 0;
      const dailiesCount = dailiesData?.availableDailies?.length || 0;
      const goalsCount = Array.isArray(goalsData) ? goalsData.length : (goalsData?.goals?.length || 0);

      // Todos: separar logs (completados) e ativos (não completados hoje)
      const todosLogsCount = todosLogsData?.todos?.length || 0;
      const todosActive = todosActiveData?.todos || [];
      const today = new Date().toISOString().split("T")[0];
      const todosActiveCount = todosActive.filter((todo: any) => todo.lastCompletedDate !== today).length;
      const todosCount = todosLogsCount + todosActiveCount;

      const total = habitsCount + dailiesCount + todosCount + goalsCount;

      return {
        habits: habitsCount,
        dailies: dailiesCount,
        todos: todosCount,
        todosCompleted: todosLogsCount,
        todosActive: todosActiveCount,
        goals: goalsCount,
        total,
        metadata: {
          totalCompleted: todosLogsCount,
          totalActive: todosActiveCount,
          total: todosCount
        }
      };
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}