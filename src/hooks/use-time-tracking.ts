import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface TimeEntry {
  id: string;
  taskId: string;
  taskType: "habit" | "daily" | "todo" | "goal";
  category: string;
  duration: number; // em segundos
  date: Date;
  userId: string;
}

// Query keys para time tracking
export const timeTrackingKeys = {
  all: ["time-tracking"] as const,
  lists: () => [...timeTrackingKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...timeTrackingKeys.lists(), filters] as const,
  details: () => [...timeTrackingKeys.all, "detail"] as const,
  detail: (id: string) => [...timeTrackingKeys.details(), id] as const,
};

// Hook para buscar todos os registros de tempo
export function useTimeEntries(filters?: {
  startDate?: Date;
  endDate?: Date;
  taskType?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: timeTrackingKeys.list(filters || {}),
    queryFn: async (): Promise<TimeEntry[]> => {
      const params = new URLSearchParams();

      if (filters?.startDate) {
        params.append("startDate", filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        params.append("endDate", filters.endDate.toISOString());
      }
      if (filters?.taskType) {
        params.append("taskType", filters.taskType);
      }
      if (filters?.category) {
        params.append("category", filters.category);
      }

      const response = await fetch(`/api/time-tracking?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar registros de tempo");
      }
      const data = await response.json();
      return data.timeEntries || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para criar registro de tempo
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<TimeEntry, "id" | "userId">): Promise<TimeEntry> => {
      const response = await fetch("/api/time-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar registro de tempo");
      }

      const result = await response.json();
      return result.timeEntry;
    },
    onSuccess: () => {
      // Invalidate all time tracking queries
      queryClient.invalidateQueries({ queryKey: timeTrackingKeys.all });
    },
  });
}

// Hook para buscar estatísticas de tempo
export function useTimeStats(filters?: {
  startDate?: Date;
  endDate?: Date;
  taskType?: string;
  category?: string;
}) {
  const { data: timeEntries = [] } = useTimeEntries(filters);

  return {
    totalTime: timeEntries.reduce((sum, entry) => sum + entry.duration, 0),
    totalEntries: timeEntries.length,
    averageTime: timeEntries.length > 0
      ? timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / timeEntries.length
      : 0,
    categoryStats: timeEntries.reduce((acc, entry) => {
      const category = entry.category;
      if (!acc[category]) {
        acc[category] = { totalTime: 0, count: 0 };
      }
      acc[category].totalTime += entry.duration;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { totalTime: number; count: number }>),
    taskTypeStats: timeEntries.reduce((acc, entry) => {
      const taskType = entry.taskType;
      if (!acc[taskType]) {
        acc[taskType] = { totalTime: 0, count: 0 };
      }
      acc[taskType].totalTime += entry.duration;
      acc[taskType].count += 1;
      return acc;
    }, {} as Record<string, { totalTime: number; count: number }>),
  };
}