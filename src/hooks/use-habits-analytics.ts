import { useQuery } from "@tanstack/react-query";

export interface HabitAnalyticsData {
	totalHabits: number;
	activeHabits: number;
	completedHabits: number;
	totalEntries: number;
	completionRate: number;
	currentStreaks: Array<{
		habitId: string;
		habitTitle: string;
		streakDays: number;
		lastEntry: string;
	}>;
	dailyProgress: Array<{
		date: string;
		entries: number;
		target: number;
		completionRate: number;
	}>;
	weeklyTrends: Array<{
		week: string;
		totalEntries: number;
		uniqueHabits: number;
		completionRate: number;
	}>;
	habitsByCategory: Array<{
		category: string;
		count: number;
		completionRate: number;
	}>;
	
	habitsByDifficulty: Array<{
		difficulty: string;
		count: number;
		completionRate: number;
	}>;
}

export function useHabitsAnalytics(timeRange: "week" | "month" | "quarter" | "year" = "month") {
	return useQuery({
		queryKey: ["habits-analytics", timeRange],
		queryFn: async (): Promise<HabitAnalyticsData> => {
			const response = await fetch(`/api/analytics/habits?timeRange=${timeRange}`);
			if (!response.ok) {
				throw new Error("Erro ao buscar analytics de hábitos");
			}
			return response.json();
		},
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}