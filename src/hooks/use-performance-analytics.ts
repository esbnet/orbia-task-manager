import { useQuery } from "@tanstack/react-query";

export interface PerformanceMetrics {
  productivity: number;
  consistency: number;
  efficiency: number;
  goalAchievement: number;
  weeklyTrend: number;
  monthlyTrend: number;
  averageTaskTime: number;
  completionRate: number;
  streakDays: number;
  bestDayOfWeek: string;
}

export interface TimeSeriesPoint {
  date: string;
  completed: number;
  planned: number;
  efficiency: number;
  score: number;
}

export interface CategoryPerformance {
  category: string;
  completionRate: number;
  averageTime: number;
  totalTasks: number;
}

export interface TagAnalysis {
  tag: string;
  color: string;
  count: number;
  efficiency: number;
  trend: "up" | "down" | "stable";
}

export interface PriorityAnalysis {
  priority: string;
  count: number;
  efficiency: number;
  trend: "up" | "down" | "stable";
}

export interface DifficultyAnalysis {
  difficulty: string;
  count: number;
  efficiency: number;
  trend: "up" | "down" | "stable";
}

export interface PerformanceAnalyticsData {
  metrics: PerformanceMetrics;
  timeSeries: TimeSeriesPoint[];
  categoryPerformance: CategoryPerformance[];
  tagAnalysis: TagAnalysis[];
  priorityAnalysis: PriorityAnalysis[];
  difficultyAnalysis: DifficultyAnalysis[];
  insights: Array<{
    type: "positive" | "improvement" | "warning";
    title: string;
    description: string;
    actionable?: string;
  }>;
  predictions: {
    nextWeekScore: number;
    recommendedGoals: string[];
    riskAreas: string[];
  };
}

export function usePerformanceAnalytics(timeRange: "week" | "month" | "quarter" = "month") {
  return useQuery({
    queryKey: ["performance-analytics", timeRange],
    queryFn: async (): Promise<PerformanceAnalyticsData> => {
      const response = await fetch(`/api/analytics/performance?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar analytics de desempenho");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}