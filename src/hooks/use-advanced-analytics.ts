import { useQuery } from "@tanstack/react-query";

export interface ProductiveHour {
  hour: number;
  completedTasks: number;
  efficiency: number;
  label: string;
}

export interface CategoryAnalysis {
  category: string;
  totalTime: number;
  completedTasks: number;
  averageTime: number;
  efficiency: number;
  trend: "up" | "down" | "stable";
}

export interface WeeklyReport {
  week: string;
  totalTasks: number;
  completedTasks: number;
  totalTime: number;
  averageDaily: number;
  bestDay: string;
  worstDay: string;
  topCategories: string[];
}

export interface AdvancedAnalyticsData {
  productiveHours: ProductiveHour[];
  categoryAnalysis: CategoryAnalysis[];
  weeklyReports: WeeklyReport[];
  monthlyTrends: {
    month: string;
    productivity: number;
    consistency: number;
    totalHours: number;
  }[];
  insights: {
    type: "productivity" | "time" | "category" | "pattern";
    title: string;
    description: string;
    recommendation: string;
    impact: "high" | "medium" | "low";
  }[];
}

export function useAdvancedAnalytics(timeRange: "week" | "month" | "quarter" = "month") {
  return useQuery({
    queryKey: ["advanced-analytics", timeRange],
    queryFn: async (): Promise<AdvancedAnalyticsData> => {
      const response = await fetch(`/api/analytics/advanced?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar analytics avançados");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}