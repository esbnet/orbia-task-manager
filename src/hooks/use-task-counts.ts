import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getTodayDateInSaoPaulo } from "@/lib/date-utils";
import { isTodoPendingForToday } from "@/lib/todo-recurrence";

// Tipos para melhor type safety
interface TaskCountsResponse {
  habits: number;
  todos: number;
  goals: number;
  total: number;
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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: taskCountKeys.counts(),
    staleTime: 60 * 1000,
    gcTime: 30 * 1000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<TaskCountsResponse> => {
      const habitsData = await queryClient.fetchQuery({
        queryKey: ["habits", "available"] as const,
        queryFn: async (): Promise<{ availableHabits: any[]; completedInCurrentPeriod: any[]; totalHabits: number }> => {
          const response = await fetch("/api/habits/available");
          if (!response.ok) {
            throw new Error(`habits: ${response.status}`);
          }
          const data = await response.json();
          return {
            availableHabits: data.availableHabits || [],
            completedInCurrentPeriod: data.completedInCurrentPeriod || [],
            totalHabits: data.totalHabits || 0,
          };
        },
        staleTime: 60 * 1000,
        gcTime: 30 * 1000,
      });

      const todos = await queryClient.fetchQuery({
        queryKey: ["todos", "list"] as const,
        queryFn: async (): Promise<any[]> => {
          const response = await fetch("/api/todos");
          if (!response.ok) {
            throw new Error(`todos: ${response.status}`);
          }
          const data = await response.json();
          return data.todos || [];
        },
        staleTime: 30 * 1000,
        gcTime: 30 * 1000,
      });

      const goals = await queryClient.fetchQuery({
        queryKey: ["goals", "IN_PROGRESS"] as const,
        queryFn: async (): Promise<any[]> => {
          const response = await fetch("/api/goals?status=IN_PROGRESS");
          if (!response.ok) {
            throw new Error(`goals: ${response.status}`);
          }
          const data = await response.json();
          return Array.isArray(data) ? data : (data.goals || []);
        },
        staleTime: 60 * 1000,
        gcTime: 30 * 1000,
      });

      const habitsCount = habitsData.availableHabits.length;
      const goalsCount = goals.length;
      const today = getTodayDateInSaoPaulo();
      const todosCount = todos.filter((todo: any) => isTodoPendingForToday(todo, today)).length;

      return {
        habits: habitsCount,
        todos: todosCount,
        goals: goalsCount,
        total: habitsCount + todosCount + goalsCount,
      };
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
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
      const [habitsResponse, todosLogsResponse, todosActiveResponse, goalsResponse] = await Promise.all([
        fetch("/api/habits/available"),
        fetch("/api/todos/logs/count"), // Logs dos todos completados
        fetch("/api/todos"), // Todos ativos
        fetch("/api/goals?status=IN_PROGRESS")
      ]);

      // Verificar se todas as respostas são OK
      if (!habitsResponse.ok || !todosLogsResponse.ok || !todosActiveResponse.ok || !goalsResponse.ok) {
        throw new Error("Erro ao buscar contagens detalhadas de tarefas");
      }

      // Extrair dados das respostas
      const [habitsData, todosLogsData, todosActiveData, goalsData] = await Promise.all([
        habitsResponse.json(),
        todosLogsResponse.json(),
        todosActiveResponse.json(),
        goalsResponse.json()
      ]);

      // Calcular contagens
      const habitsCount = habitsData?.availableHabits?.length || 0;
      const goalsCount = Array.isArray(goalsData) ? goalsData.length : (goalsData?.goals?.length || 0);

      // Todos: separar logs (completados) e ativos (não completados hoje)
      const todosLogsCount = todosLogsData?.todos?.length || 0;
      const todosActive = todosActiveData?.todos || [];
      const today = getTodayDateInSaoPaulo();
      const todosActiveCount = todosActive.filter((todo: any) => isTodoPendingForToday(todo, today)).length;
      const todosCount = todosLogsCount + todosActiveCount;

      const total = habitsCount + todosCount + goalsCount;

      return {
        habits: habitsCount,
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